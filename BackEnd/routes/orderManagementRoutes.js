const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "AdDU2202201425196", // Change pw
  database: "tycherosdb"
});

router.get('/getOrders', (req, res) => {
  // Fetch the orders with their total amounts
  const ordersQuery = `
    SELECT
      o.orderID,
      p.paymentID,
      os.employeeID,
      MAX(os.statusDateTime) AS date,  -- Latest status change date as the order date
      os.orderStatus AS status,        -- Latest status of the order
      SUM(pr.sellingPrice * oi.quantity) AS Total
    FROM
      \`order\` o
    JOIN orderitem oi ON o.orderID = oi.orderID
    JOIN price pr ON oi.productID = pr.productID
    JOIN orderstatus os ON o.orderID = os.orderID
    LEFT JOIN payment p ON o.orderID = p.orderID
    WHERE
      pr.priceID = (
        SELECT MAX(pr2.priceID)
        FROM price pr2
        WHERE pr2.productID = oi.productID
      )
      AND os.statusDateTime = (
        SELECT MAX(os2.statusDateTime)
        FROM orderstatus os2
        WHERE os2.orderID = o.orderID
      )  -- Ensure we only get the latest status for each order
    GROUP BY o.orderID, p.paymentID, os.employeeID, os.orderStatus
    ORDER BY date DESC;
  `;

  db.query(ordersQuery, (err, ordersResult) => {
    if (err) {
      console.error("Error fetching orders:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Initialize a map to collect orders
    const ordersMap = new Map();

    // Process the orders result set
    ordersResult.forEach(row => {
      ordersMap.set(row.orderID, {
        orderID: row.orderID,
        paymentID: row.paymentID,
        employeeID: row.employeeID,
        date: row.date,
        status: row.status,
        amount: row.Total,
        orderItems: []
      });
    });

    // Fetch order items with product names and prices
    const orderItemsQuery = `
      SELECT
        oi.orderID,
        oi.productID,
        p.productName,
        pr.sellingPrice,
        oi.quantity
      FROM
        orderitem oi
      JOIN product p ON oi.productID = p.productID
      JOIN price pr ON oi.productID = pr.productID
      WHERE
        pr.priceID = (
          SELECT MAX(pr2.priceID)
          FROM price pr2
          WHERE pr2.productID = oi.productID
        );
    `;

    db.query(orderItemsQuery, (err, orderItemsResult) => {
      if (err) {
        console.error("Error fetching order items:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      // Process the order items result set
      orderItemsResult.forEach(row => {
        if (ordersMap.has(row.orderID)) {
          const order = ordersMap.get(row.orderID);
          order.orderItems.push({
            productID: row.productID,
            productName: row.productName,
            sellingPrice: row.sellingPrice,
            quantity: row.quantity
          });
        }
      });

      // Convert map to array
      const ordersArray = Array.from(ordersMap.values());

      res.json(ordersArray);
    });
  });
});

// Endpoint to get menu data
router.get('/getMenuData', (req, res) => {
  const menuDataQuery = `
    SELECT
      p.productID,
      p.productName,
      pr.sellingPrice
    FROM
      product p
    JOIN price pr ON p.productID = pr.productID
    WHERE
      pr.priceID = (
        SELECT MAX(pr2.priceID)
        FROM price pr2
        WHERE pr2.productID = p.productID
      )
  `;

  db.query(menuDataQuery, (err, result) => {
    if (err) {
      console.error("Error fetching menu data:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    res.json(result);
  });
});

// POST /processPayment endpoint
router.post('/processPayment', (req, res) => {
  const { orderID, amount, method, referenceNumber, discountType, discountAmount } = req.body;

  // Start a transaction
  db.beginTransaction(err => {
    if (err) return res.status(500).json({ error: "Transaction error" });

    // Insert into Payment table
    const insertPaymentQuery = `
      INSERT INTO payment (amount, method, referenceNumber, discountType, discountAmount)
      VALUES (?, ?, ?, ?, ?)`;
    db.query(insertPaymentQuery, [amount, method, referenceNumber, discountType, discountAmount], (err, results) => {
      if (err) {
        return db.rollback(() => res.status(500).json({ error: "Failed to insert payment" }));
      }

      const paymentID = results.insertId;
      console.log("discountAmount:", discountAmount);

      // Update the Order table with paymentID
      const updateOrderQuery = `
        UPDATE \`order\` 
        SET paymentID = ?, status = 'Pending'
        WHERE orderID = ?`;
      db.query(updateOrderQuery, [paymentID, orderID], (err) => {
        if (err) {
          return db.rollback(() => res.status(500).json({ error: "Failed to update order" }));
        }

        // Commit the transaction
        db.commit(err => {
          if (err) {
            return db.rollback(() => res.status(500).json({ error: "Failed to commit transaction" }));
          }
          res.status(200).json({ message: "Payment processed successfully" });
        });
      });
    });
  });
});

// PUT /updateOrderStatus endpoint
router.put('/updateOrderStatus', (req, res) => {
  const { orderID, newStatus } = req.body;

  if (!orderID || !newStatus) {
    return res.status(400).json({ error: 'OrderID and newStatus are required' });
  }

  const updateOrderQuery = `
    UPDATE \`order\`
    SET status = ?
    WHERE orderID = ?
  `;

  db.query(updateOrderQuery, [newStatus, orderID], (err, result) => {
    if (err) {
      console.error("Error updating order status:", err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json({ message: 'Order status updated successfully' });
  });
});

router.post('/cancelOrder', (req, res) => {
  const { orderID, cancellationReason, cancellationType, subitemsUsed } = req.body;

  console.log("Request received for cancelling order:", {
    orderID,
    cancellationReason,
    cancellationType, // The order's original status before cancellation
    subitemsUsed,
  });

  // Start transaction
  db.beginTransaction((err) => {
    if (err) {
      console.error("Error starting transaction:", err);
      return res.status(500).send("Error starting transaction");
    }

    // Insert into cancelledOrders table with the cancellationType
    const insertCancelledOrderQuery = `
      INSERT INTO cancelledOrders (orderID, cancellationReason, cancellationType)
      VALUES (?, ?, ?)
    `;
    db.query(insertCancelledOrderQuery, [orderID, cancellationReason, cancellationType], (err, result) => {
      if (err) {
        console.error("Error inserting into cancelledOrders:", err);
        return db.rollback(() => res.status(500).send("Error inserting into cancelledOrders"));
      }

      const cancelledOrderID = result.insertId;
      console.log("Cancelled order inserted with ID:", cancelledOrderID);

      // Validate if all subitemsUsed exist in subitem table
      const subitemIDs = subitemsUsed.map(subitem => subitem.subitemID);

      const checkSubitemsQuery = `
        SELECT subitemID FROM subitem WHERE subitemID IN (?)
      `;
      db.query(checkSubitemsQuery, [subitemIDs], (err, result) => {
        if (err) {
          console.error("Error validating subitemIDs:", err);
          return db.rollback(() => res.status(500).send("Error validating subitemIDs"));
        }

        const validSubitemIDs = result.map(row => row.subitemID);
        const invalidSubitemIDs = subitemIDs.filter(id => !validSubitemIDs.includes(id));

        if (invalidSubitemIDs.length > 0) {
          console.error("Invalid subitemIDs found:", invalidSubitemIDs);
          return db.rollback(() => res.status(400).send("Invalid subitemIDs: " + invalidSubitemIDs.join(', ')));
        }

        // Insert each valid subitem used into subitemused table
        const insertSubitemUsedPromises = subitemsUsed.map((subitem) => {
          return new Promise((resolve, reject) => {
            const insertSubitemUsedQuery = `
              INSERT INTO subitemused (subitemID, quantityUsed, cancelledOrderID)
              VALUES (?, ?, ?)
            `;
            db.query(insertSubitemUsedQuery, [subitem.subitemID, subitem.quantityUsed, cancelledOrderID], (err) => {
              if (err) {
                return reject(err);
              }
              resolve();
            });
          });
        });

        // Execute all subitem inserts
        Promise.all(insertSubitemUsedPromises)
          .then(() => {
            db.commit((err) => {
              if (err) {
                console.error("Error committing transaction:", err);
                return db.rollback(() => res.status(500).send("Error committing transaction"));
              }
              console.log("Order cancellation transaction committed successfully.");
              res.status(200).send("Order cancelled successfully");
            });
          })
          .catch((err) => {
            console.error("Error inserting subitems used:", err);
            db.rollback(() => res.status(500).send("Error inserting subitems used"));
          });
      });
    });
  });
});

// GET Payment Details for all Orders where status is not 'Unpaid'
router.get('/getPaymentDetails', (req, res) => {
  const query = `
    SELECT 
      p.paymentID,
      p.amount,
      p.method,
      p.referenceNumber,
      d.discountType,
      d.discountAmount,
      o.orderID,
      os.orderStatus,
      os.statusDateTime
    FROM 
      \`order\` o
    JOIN 
      payment p ON o.orderID = p.orderID
    LEFT JOIN 
      discount d ON p.paymentID = d.discountID
    JOIN 
      orderstatus os ON o.orderID = os.orderID
    WHERE 
      os.orderStatus != 'Unpaid';
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error('Error fetching payment details:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'No payment details found for orders with status other than Unpaid' });
    }

    res.status(200).json(result);
  });
});

module.exports = router;