// routes/inventoryManagementRoutes.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "AdDU2202201425196", // Change pw
  database: "tycherosdb"
};

// Create a pool of connections to handle database requests
const pool = mysql.createPool(dbConfig);

// INVENTORY MANAGEMENT ROUTES :3
// Configured
router.get('/getInventoryName', async (req, res) => {
  const query = `SELECT * FROM inventory`;
  try {
    const [data] = await pool.query(query);
    return res.json(data);
  } catch (err) {
    console.error('Error fetching inventory names:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET INVENTORY DATA ENDPOINT Configured
router.get('/getInventoryItem', async (req, res) => {
  const query = `
    WITH InventoryTotals AS (
        SELECT 
            inv.inventoryID,
            inv.inventoryName,
            inv.inventoryCategory,
            inv.reorderPoint,
            inv.unitOfMeasurementID, 
            uom.UoM AS unitOfMeasure,
            inv.inventoryStatus, 
            COALESCE(SUM(CASE WHEN si.quantityRemaining > 0 THEN si.quantityRemaining ELSE 0 END), 0) AS totalQuantity  -- Total positive quantityRemaining for each inventoryID
        FROM 
            inventory inv
        LEFT JOIN 
            subinventory si ON inv.inventoryID = si.inventoryID AND si.quantityRemaining > 0 -- Include only positive quantities
        LEFT JOIN
            unitofmeasurement uom ON inv.unitOfMeasurementID = uom.unitOfMeasurementID  -- Join with unitofmeasurement table
        GROUP BY 
            inv.inventoryID, inv.inventoryName, inv.inventoryCategory, inv.reorderPoint, inv.unitOfMeasurementID, uom.UoM, inv.inventoryStatus
    )
    SELECT 
        inventoryID,  
        inventoryName,
        inventoryCategory,
        reorderPoint,
        unitOfMeasurementID,
        unitOfMeasure,
        totalQuantity,
        inventoryStatus 
    FROM 
        InventoryTotals
    ORDER BY 
        inventoryName ASC,  
        inventoryID ASC;
  `;

  try {
    const [result] = await pool.query(query);
    res.json(result);
  } catch (err) {
    console.error("Error fetching inventory data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET Subitem Details by Inventory ID Configured
router.get('/getInventoryItemDetails/:inventoryID', async (req, res) => {
  const { inventoryID } = req.params;

  const query = `
    SELECT 
      si.subinventoryID, 
      si.quantityRemaining,
      poi.quantityOrdered,
      poi.pricePerPOUoM AS pricePerUnit,
      poi.expiryDate,
      po.stockInDateTime AS stockInDate,
      s.supplierName,
      CONCAT(e.firstName, ' ', e.lastName) AS employeeName,
      uom.UoM as poUoM -- Fetch the UoM from the unitofmeasurement table
    FROM 
      subinventory si
    LEFT JOIN 
      purchaseorderitem poi ON si.subinventoryID = poi.purchaseOrderItemID
    LEFT JOIN 
      purchaseorder po ON poi.purchaseOrderID = po.purchaseOrderID
    LEFT JOIN 
      supplier s ON po.supplierID = s.supplierID
    LEFT JOIN 
      employees e ON po.employeeID = e.employeeID
    LEFT JOIN 
      unitofmeasurement uom ON poi.unitOfMeasurementID = uom.unitOfMeasurementID  -- Join with unitofmeasurement table
    WHERE 
      si.inventoryID = ?
      AND si.quantityRemaining > 0
    ORDER BY 
      poi.expiryDate ASC;  -- Order by expiryDate, earliest first
  `;

  try {
    const [result] = await pool.query(query, [inventoryID]);
    res.json(result);
  } catch (err) {
    console.error("Error fetching subitem details:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ADD INVENTORY ITEM ENDPOINT Configured
router.post('/postInventoryItem', async (req, res) => {
  const { inventoryName, inventoryCategory, unitOfMeasure, reorderPoint, inventoryStatus } = req.body;

  const newInventoryItem = {
    inventoryName,
    inventoryCategory,
    unitOfMeasurementID: unitOfMeasure,
    reorderPoint,
    inventoryStatus,
  };

  try {
    const [result] = await pool.query("INSERT INTO inventory SET ?", newInventoryItem);
    res.json({ message: "Inventory item added successfully", inventoryID: result.insertId });
  } catch (err) {
    console.error("Error adding inventory item:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// UPDATE SUBITEM ENDPOINT
router.put('/putInventoryItem/:inventoryID', async (req, res) => {
  const inventoryID = req.params.inventoryID;
  const updatedData = req.body;

  const updateQuery = `
    UPDATE inventory
    SET inventoryName = COALESCE(?, inventoryName),
        inventoryCategory = COALESCE(?, inventoryCategory),
        unitOfMeasurementID = COALESCE(?, unitOfMeasurementID),
        reorderPoint = COALESCE(?, reorderPoint),
        inventoryStatus = COALESCE(?, inventoryStatus)
    WHERE inventoryID = ?
  `;

  const updateValues = [
    updatedData.inventoryName || null,
    updatedData.inventoryCategory || null,
    updatedData.unitOfMeasurementID || null,
    updatedData.reorderPoint || null,
    updatedData.inventoryStatus || null,
    inventoryID
  ];

  try {
    await pool.query(updateQuery, updateValues);
    res.json({ message: "Subitem updated successfully" });
  } catch (err) {
    console.error("Error updating inventory:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// STOCK IN STOCK OUT STOCK IN STOCK OUT STOCK IN STOCK OUT STOCK IN STOCK OUT STOCK IN STOCK OUT STOCK IN STOCK OUT STOCK IN STOCK OUT 

// Endpoint to get UoMs in the same category as the specified inventory item's UoM
router.get('/getUoMsByCategory/:inventoryID', async (req, res) => {
  const { inventoryID } = req.params;

  const query = `
    SELECT uom.*
    FROM unitofmeasurement uom
    WHERE uom.category = (
        SELECT uom2.category
        FROM unitofmeasurement uom2
        JOIN inventory inv ON inv.unitOfMeasurementID = uom2.unitOfMeasurementID
        WHERE inv.inventoryID = ?
    );
  `;

  try {
    const [rows] = await pool.query(query, [inventoryID]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching UoMs by category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/stockInInventoryItem', async (req, res) => {
  const {
    supplierName,
    employeeID,
    stockInDateTime,
    inventoryItems,
  } = req.body;
  const connection = await pool.getConnection();
  console.log("Request Body: ", req.body);

  try {
    await connection.beginTransaction();

    // 1. Check if the supplier already exists
    const [existingSupplier] = await connection.query(
      'SELECT supplierID FROM supplier WHERE supplierName = ?',
      [supplierName]
    );

    let supplierID;
    if (existingSupplier.length > 0) {
      supplierID = existingSupplier[0].supplierID;
    } else {
      const [supplierResult] = await connection.query(
        'INSERT INTO supplier (supplierName) VALUES (?)',
        [supplierName]
      );
      supplierID = supplierResult.insertId;
    }

    // 2. Insert into the purchaseorder table
    const [purchaseOrderResult] = await connection.query(
      `INSERT INTO purchaseorder (supplierID, employeeID, stockInDateTime) VALUES (?, ?, ?)`,
      [supplierID, employeeID, stockInDateTime]
    );
    const purchaseOrderID = purchaseOrderResult.insertId;

    // 3. Loop through each inventory item and add it
    for (let item of inventoryItems) {
      const {
        inventoryID,
        quantityOrdered,
        pricePerPOUoM,
        expiryDate,
        unitOfMeasurementID,
      } = item;

      // Retrieve the unit conversion ratio from `unitofmeasurement` table
      const [unitResult] = await connection.query(
        `SELECT ratio FROM unitofmeasurement WHERE unitOfMeasurementID = ?`,
        [unitOfMeasurementID]
      );

      if (unitResult.length === 0) {
        throw new Error(`Unit of Measurement ID ${unitOfMeasurementID} not found`);
      }

      const conversionRatio = unitResult[0].ratio;
      const convertedQuantity = quantityOrdered * conversionRatio;

      // Insert into the purchaseorderitem table
      const [purchaseOrderItemResult] = await connection.query(
        `INSERT INTO purchaseorderitem (quantityOrdered, pricePerPOUoM, expiryDate, unitOfMeasurementID, purchaseOrderID) 
         VALUES (?, ?, ?, ?, ?)`,
        [quantityOrdered, pricePerPOUoM, expiryDate, unitOfMeasurementID, purchaseOrderID]
      );
      const purchaseOrderItemID = purchaseOrderItemResult.insertId;

      // Insert into the subinventory table, using purchaseOrderItemID as the primary key
      await connection.query(
        'INSERT INTO subinventory (subinventoryID, inventoryID, quantityRemaining) VALUES (?, ?, ?)',
        [purchaseOrderItemID, inventoryID, convertedQuantity]
      );
    }

    await connection.commit();
    res.status(201).send({
      message: 'Products stocked in successfully',
      supplierID,
      purchaseOrderID,
    });
  } catch (err) {
    await connection.rollback();
    console.error('Error stocking in subitems:', err);
    res.status(500).send(err);
  } finally {
    connection.release();
  }
});

// STOCK OUT SUBITEM ENDPOINT
router.post('/stockOutSubitem', async (req, res) => {
  const { inventoryID, quantity, reason } = req.body; // Assume inventoryID is provided
  const date = new Date();

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Find the subinventory entries for the given inventoryID, ordered by the oldest expiry date
    const [subinventoryEntries] = await connection.query(`
      SELECT si.subinventoryID, si.quantityRemaining, poi.expiryDate
      FROM subinventory si
      JOIN purchaseorderitem poi ON si.subinventoryID = poi.purchaseOrderItemID
      WHERE si.inventoryID = ? AND si.quantityRemaining > 0
      ORDER BY poi.expiryDate ASC
    `, [inventoryID]);

    let remainingQuantity = quantity;
    
    for (const entry of subinventoryEntries) {
      if (remainingQuantity <= 0) break;

      const deductQuantity = Math.min(entry.quantityRemaining, remainingQuantity);

      // Update the quantityRemaining
      await connection.query(`
        UPDATE subinventory
        SET quantityRemaining = quantityRemaining - ?
        WHERE subinventoryID = ?
      `, [deductQuantity, entry.subinventoryID]);

      remainingQuantity -= deductQuantity;

      // Insert the stock-out record
      await connection.query(`
        INSERT INTO stockout (subinventoryID, quantity, reason, date)
        VALUES (?, ?, ?, ?)
      `, [entry.subinventoryID, deductQuantity, reason, date]);
    }

    if (remainingQuantity > 0) {
      throw new Error('Not enough stock available to complete the stock-out.');
    }

    await connection.commit();
    res.status(201).send('Stock-out recorded successfully');
  } catch (err) {
    await connection.rollback();
    console.error("Error processing stock-out:", err);
    res.status(500).send(`Error processing stock-out: ${err.message}`);
  } finally {
    connection.release();
  }
});

// UPDATE SUBINVENTORY ITEM QUANTITY Configured
router.put('/updateSubinventoryQuantity', async (req, res) => {
  const { inventoryID, quantity } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Find the subinventory entry with the oldest expiry date
    const [subinventoryEntries] = await connection.query(`
      SELECT si.subinventoryID, si.quantityRemaining
      FROM subinventory si
      JOIN purchaseorderitem poi ON si.subinventoryID = poi.purchaseOrderItemID
      WHERE si.inventoryID = ?
      ORDER BY poi.expiryDate ASC
      LIMIT 1
    `, [inventoryID]);

    if (subinventoryEntries.length === 0) {
      throw new Error('No subinventory found for the given inventoryID.');
    }

    const subinventoryID = subinventoryEntries[0].subinventoryID;

    // Update the quantityRemaining
    await connection.query(`
      UPDATE subinventory
      SET quantityRemaining = ?
      WHERE subinventoryID = ?
    `, [quantity, subinventoryID]);

    await connection.commit();
    res.status(200).send('Quantity updated successfully');
  } catch (err) {
    await connection.rollback();
    console.error('Error updating subinventory quantity:', err);
    res.status(500).send(`Error updating subinventory quantity: ${err.message}`);
  } finally {
    connection.release();
  }
});

// UPDATE INVENTORY STATUS
router.put('/updateStatus/:inventoryID', async (req, res) => {
  const { inventoryStatus } = req.body;
  const { inventoryID } = req.params; // Get inventoryID from URL
  console.log("InventoryID: ", inventoryID);
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Check if the inventoryID exists before updating
    const [inventoryEntries] = await connection.query(`
      SELECT inventoryID
      FROM inventory
      WHERE inventoryID = ?
    `, [inventoryID]);

    if (inventoryEntries.length === 0) {
      throw new Error('No inventory found for the given inventoryID.');
    }

    // Update the inventoryStatus
    await connection.query(`
      UPDATE inventory
      SET inventoryStatus = ?
      WHERE inventoryID = ?
    `, [inventoryStatus, inventoryID]);

    await connection.commit();
    res.status(200).send('Inventory status updated successfully');
  } catch (err) {
    await connection.rollback();
    console.error('Error updating inventory status:', err);
    res.status(500).send(`Error updating inventory status: ${err.message}`);
  } finally {
    connection.release();
  }
});

// GET all Unit of Measurements where type is "reference"
router.get('/getReferenceUnits', async (req, res) => {
  const query = `
    SELECT 
      unitOfMeasurementID, 
      category, 
      UoM, 
      type, 
      ratio, 
      status
    FROM 
      unitofmeasurement
    WHERE 
      type = 'reference' AND status = 1
  `;

  try {
    const [result] = await pool.query(query);
    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching reference units:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



module.exports = router;
