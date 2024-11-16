// routes/orderingRoutes.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "AdDU2202201425196", // Change pw
  database: "tycherosdb"
});

//ORDERING
//PAGE
//ENDPOINTS

// GET MENU DATA ENDPOINT CONFIGURED
router.get('/getCustomerMenu', (req, res) => {
    const query = `
      SELECT 
          p.productID, 
          p.productName, 
          p.imageUrl, 
          c.categoryName AS categoryName, 
          pr.sellingPrice,
          p.status
      FROM 
          product p
      JOIN 
          category c ON p.categoryID = c.categoryID
      JOIN 
          price pr ON p.productID = pr.productID
      WHERE 
          pr.priceDateTime = (
              SELECT MAX(pr2.priceDateTime)
              FROM price pr2
              WHERE pr2.productID = p.productID AND p.status = 1
          )
    `;
  
    db.query(query, (err, result) => {
      if (err) {
        console.error("Error fetching menu data:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json(result);
    });
  });

// CREATE ORDER ENDPOINT
router.post('/createOrder', (req, res) => {
  const { orderitems } = req.body;

  // Insert into order table
  const orderQuery = `
    INSERT INTO \`order\` ()
    VALUES ()
  `;

  db.query(orderQuery, (err, result) => {
    if (err) {
      console.error("Error creating order:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    const orderID = result.insertId;

    // Insert into orderitem table if there are items in the order
    if (orderitems && orderitems.length > 0) {
      const orderItemsQuery = `
        INSERT INTO orderitem (orderID, productID, quantity)
        VALUES ?
      `;

      const orderItemsValues = orderitems.map(item => [orderID, item.productID, item.quantity]);

      db.query(orderItemsQuery, [orderItemsValues], (err) => {
        if (err) {
          console.error("Error creating order items:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        // Insert initial order status as 'Unpaid'
        const initialStatusQuery = `
          INSERT INTO orderstatus (orderID, orderStatus, statusDateTime)
          VALUES (?, 'Unpaid', NOW())
        `;

        db.query(initialStatusQuery, [orderID], (err) => {
          if (err) {
            console.error("Error setting initial order status:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }

          res.json({ message: "Order and order items created successfully", orderID });
        });
      });
    } else {
      // Insert initial order status as 'Unpaid' even if no order items are provided
      const initialStatusQuery = `
        INSERT INTO orderstatus (orderID, orderStatus, statusDateTime)
        VALUES (?, 'Unpaid', NOW())
      `;

      db.query(initialStatusQuery, [orderID], (err) => {
        if (err) {
          console.error("Error setting initial order status:", err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        res.json({ message: "Order created successfully without order items", orderID });
      });
    }
  });
});

// GET Subinventory Details for Products in Cart
router.post('/getSubinventoryDetails', (req, res) => {
  const { productIDs } = req.body; // Array of product IDs from the cart
  console.log("Product IDs: ", productIDs)

  if (!productIDs || productIDs.length === 0) {
    return res.status(400).json({ error: "Product IDs are required" });
  }

  const query = `
    SELECT DISTINCT
      si.subinventoryID,
      si.quantityRemaining,
      si.inventoryID,
      poi.expiryDate,
      p.productID,
      s.subitemID,
      s.quantityNeeded,
      inv.inventoryName
    FROM 
      product p
    JOIN 
      subitem s ON p.productID = s.productID
    JOIN 
      inventory inv ON s.inventoryID = inv.inventoryID
    JOIN 
      subinventory si ON inv.inventoryID = si.inventoryID
    JOIN 
      purchaseOrderItem poi ON si.subinventoryID = poi.purchaseOrderItemID
    WHERE 
      p.productID IN (?)
      AND si.quantityRemaining > 0
    ORDER BY 
      si.inventoryID, poi.expiryDate ASC;
  `;

  db.query(query, [productIDs], (err, results) => {
    if (err) {
      console.error("Error fetching subinventory details:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Log the results for debugging
    console.log("Fetched Unique Subinventory Details:", results);

    // Return the results as a JSON response
    res.json(results);
  });
});

// Endpoint to get necessary subinventoryIDs based on inventoryID and total needed quantity
router.post('/getSubinventoryID', async (req, res) => {
  const { inventoryID, totalInventoryQuantityNeeded } = req.body;

  if (!inventoryID || !totalInventoryQuantityNeeded) {
    return res.status(400).json({ error: 'InventoryID and totalInventoryQuantityNeeded are required' });
  }

  const query = `
    SELECT DISTINCT
      si.subinventoryID,
      si.quantityRemaining,
      si.inventoryID,
      poi.expiryDate,
      inv.inventoryName
    FROM 
      inventory inv
    JOIN 
      subinventory si ON inv.inventoryID = si.inventoryID
    JOIN 
      purchaseorderitem poi ON si.subinventoryID = poi.purchaseOrderItemID
    WHERE 
      inv.inventoryID = ? 
      AND si.quantityRemaining > 0
    ORDER BY 
      si.inventoryID, poi.expiryDate ASC;
  `;

  try {
    // Execute the query
    const [results] = await db.promise().query(query, [inventoryID]);

    // Calculate total quantity remaining and filter necessary subinventoryIDs
    let remainingNeeded = totalInventoryQuantityNeeded;
    let necessarySubinventoryIDs = [];
    let totalQuantityRemaining = 0;

    for (let sub of results) {
      if (remainingNeeded <= 0) break;

      const availableQty = sub.quantityRemaining;
      totalQuantityRemaining += availableQty;

      const quantityToUse = Math.min(availableQty, remainingNeeded);
      necessarySubinventoryIDs.push({
        subinventoryID: sub.subinventoryID,
        quantityToUse: quantityToUse,
      });

      remainingNeeded -= quantityToUse;
    }

    // If total available quantity is less than needed, send a warning
    if (totalQuantityRemaining < totalInventoryQuantityNeeded) {
      console.warn(`Not enough stock available for inventoryID ${inventoryID}. Needed: ${totalInventoryQuantityNeeded}, Available: ${totalQuantityRemaining}`);
    }

    res.status(200).json({ necessarySubinventoryIDs, totalQuantityRemaining });
  } catch (err) {
    console.error('Error fetching subinventory IDs:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// UPDATE MULTIPLE SUBINVENTORY QUANTITIES
router.put('/updateMultipleSubitemQuantities', (req, res) => {
  const { updates } = req.body; // Array of updates, each with subinventoryID and quantity to reduce

  // Log the incoming updates array for debugging purposes
  console.log('Received updates for subinventory quantities:', updates);

  // Start a transaction
  db.beginTransaction(err => {
    if (err) {
      console.error('Error starting transaction:', err);
      return res.status(500).send("Error starting transaction");
    }

    // Iterate through each update and apply the quantity reduction
    const updatePromises = updates.map(update => {
      return new Promise((resolve, reject) => {
        const { subinventoryID, quantityToReduce } = update;

        // Update the quantityRemaining, ensuring no value goes below zero
        const updateQuery = `
          UPDATE subinventory
          SET quantityRemaining = GREATEST(quantityRemaining - ?, 0)
          WHERE subinventoryID = ?
        `;

        db.query(updateQuery, [quantityToReduce, subinventoryID], (err, result) => {
          if (err) {
            return reject(err);
          }

          console.log(`Updated subinventoryID ${subinventoryID}: reduced by ${quantityToReduce}`);
          resolve();
        });
      });
    });

    // Execute all update promises
    Promise.all(updatePromises)
      .then(() => {
        db.commit(err => {
          if (err) {
            console.error('Error committing transaction:', err);
            return db.rollback(() => res.status(500).send("Error committing transaction"));
          }

          console.log('Transaction committed successfully.');
          res.status(200).send('Subinventory quantities updated successfully');
        });
      })
      .catch(err => {
        console.error('Error updating subinventory quantities:', err);
        db.rollback(() => res.status(500).send("Error updating subinventory quantities"));
      });
  });
});

// GET /getOrderStatuses endpoint
router.get('/getOrderStatuses/:orderID', (req, res) => {
  const { orderID } = req.params;

  if (!orderID) {
    return res.status(400).json({ error: 'OrderID is required' });
  }

  const getStatusesQuery = `
    SELECT
      os.orderStatus AS status,
      os.statusDateTime,
      os.employeeID,
      e.firstName,
      e.lastName
    FROM
      orderstatus os
    LEFT JOIN
      employees e ON os.employeeID = e.employeeID
    WHERE
      os.orderID = ?
    ORDER BY
      os.statusDateTime ASC
  `;

  db.query(getStatusesQuery, [orderID], (err, results) => {
    if (err) {
      console.error('Error fetching order statuses:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No statuses found for the specified orderID' });
    }

    const statusRecords = results.map((record) => ({
      status: record.status,
      statusDateTime: record.statusDateTime,
      employeeID: record.employeeID,
      employeeName: record.employeeID ? `${record.firstName} ${record.lastName}` : 'N/A',
    }));

    res.status(200).json(statusRecords);
  });
});

module.exports = router;