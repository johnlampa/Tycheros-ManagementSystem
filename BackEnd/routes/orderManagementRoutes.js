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
      SUM(pr.sellingPrice * oi.quantity) AS Total,
      p.method                          -- Payment method from the payment table
    FROM
      \`order\` o
    JOIN orderitem oi ON o.orderID = oi.orderID
    JOIN price pr ON oi.productID = pr.productID
    JOIN orderstatus os ON o.orderID = os.orderID
    LEFT JOIN payment p ON os.orderStatusID = p.orderStatusID  -- Adjusted to reference orderstatusID
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
    GROUP BY o.orderID, p.paymentID, os.employeeID, os.orderStatus, p.method
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
        method: row.method,
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

router.post('/processPayment', (req, res) => {
  const { orderID, amount, method, referenceNumber, discountType, discountAmount, employeeID } = req.body;
  console.log("Request Body:", req.body);

  // Start a transaction
  db.beginTransaction(err => {
    if (err) return res.status(500).json({ error: "Transaction error" });

    // Step 1: Insert a new row into the `orderstatus` table to reflect the payment status
    const insertOrderStatusQuery = `
      INSERT INTO orderstatus (orderID, orderStatus, statusDateTime, employeeID)
      VALUES (?, 'Pending', NOW(), ?)
    `;
    db.query(insertOrderStatusQuery, [orderID, employeeID], (err, results) => {
      if (err) {
        console.error("Error inserting into orderstatus:", err);
        return db.rollback(() => res.status(500).json({ error: "Failed to update order status" }));
      }

      const orderStatusID = results.insertId; // Get the newly created orderstatus ID

      // Step 2: Insert into the `payment` table, referencing the `orderstatus` ID
      const insertPaymentQuery = `
        INSERT INTO payment (amount, method, referenceNumber, orderStatusID)
        VALUES (?, ?, ?, ?)
      `;
      db.query(insertPaymentQuery, [amount, method, referenceNumber, orderStatusID], (err, payment) => {
        if (err) {
          console.error("Error inserting into payment:", err);
          return db.rollback(() => res.status(500).json({ error: "Failed to insert payment" }));
        }

        const paymentID = payment.insertId; // Get the newly created orderstatus ID

        // Step 3: Check if a discount is applied, then insert into the `discount` table
        if (discountType && discountAmount) {
          const insertDiscountQuery = `
            INSERT INTO discount (discountID, discountType, discountAmount)
            VALUES (?, ?, ?)
          `;
          db.query(insertDiscountQuery, [paymentID, discountType, discountAmount], (err) => {
            if (err) {
              console.error("Error inserting into discount:", err);
              return db.rollback(() => res.status(500).json({ error: "Failed to insert discount" }));
            }
          });
        }

        // Step 4: Commit the transaction after successful inserts
        db.commit(err => {
          if (err) {
            console.error("Error committing transaction:", err);
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
  const { orderID, newStatus, employeeID, reason, updatePayment, cancellationReason } = req.body;

  if (!orderID || !newStatus) {
    return res.status(400).json({ error: 'OrderID and newStatus are required' });
  }

  const insertOrderStatusQuery = `
    INSERT INTO orderstatus (orderID, orderStatus, statusDateTime, employeeID, reason)
    VALUES (?, ?, NOW(), ?, ?)
  `;

  db.query(insertOrderStatusQuery, [orderID, newStatus, employeeID || null, reason || null], (err, result) => {
    if (err) {
      console.error("Error inserting order status:", err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const orderStatusID = result.insertId; // Retrieve the newly inserted orderstatusID
    console.log("OrderStatusIDCompleted: ", orderStatusID, orderID);

    // If the payment table needs to be updated
    if (updatePayment) {
      const fetchPaymentsQuery = `
        SELECT paymentID
        FROM payment
        WHERE orderStatusID IN (
          SELECT orderStatusID
          FROM orderstatus
          WHERE orderID = ?
        )
      `;

      db.query(fetchPaymentsQuery, [orderID], (err, paymentsResult) => {
        if (err) {
          console.error("Error fetching payments associated with the orderID:", err);
          return res.status(500).json({ error: 'Failed to fetch payments' });
        }

        const paymentIDs = paymentsResult.map(payment => payment.paymentID);

        if (paymentIDs.length === 0) {
          console.log("No associated payments found to update.");
          return res.status(200).json({ message: 'Order status updated, no payments found to update.' });
        }

        const updatePaymentsQuery = `
          UPDATE payment
          SET orderStatusID = ?
          WHERE paymentID IN (?)
        `;

        db.query(updatePaymentsQuery, [orderStatusID, paymentIDs], (err) => {
          if (err) {
            console.error("Error updating payment table:", err);
            return res.status(500).json({ error: 'Failed to update payment table' });
          }

          res.status(200).json({ message: 'Order status and associated payments updated successfully' });
        });
      });
    } else {
      res.status(200).json({ message: 'Order status updated successfully' });
    }
  });
});

router.post('/cancelOrder', (req, res) => {
  const { orderID, cancellationReason, employeeID } = req.body;

  console.log("Request received for cancelling order:", {
    orderID,
    cancellationReason,
    employeeID,
  });

  // Start transaction
  db.beginTransaction((err) => {
    if (err) {
      console.error("Error starting transaction:", err);
      return res.status(500).send("Error starting transaction");
    }

    // Check if the order exists and get its current status
    const checkOrderStatusQuery = `
      SELECT orderStatus
      FROM orderstatus
      WHERE orderID = ?
      ORDER BY statusDateTime DESC
      LIMIT 1
    `;

    db.query(checkOrderStatusQuery, [orderID], (err, result) => {
      if (err) {
        console.error("Error checking order status:", err);
        return db.rollback(() => res.status(500).send("Error checking order status"));
      }

      if (result.length === 0) {
        console.error("Order not found:", orderID);
        return db.rollback(() => res.status(404).send("Order not found"));
      }

      const currentStatus = result[0].orderStatus;

      if (currentStatus === 'Cancelled') {
        console.error("Order is already cancelled:", orderID);
        return db.rollback(() => res.status(400).send("Order is already cancelled"));
      }

      // Insert a new row in the orderstatus table to mark the order as 'Cancelled'
      const insertOrderStatusQuery = `
        INSERT INTO orderstatus (orderID, orderStatus, statusDateTime, reason, employeeID)
        VALUES (?, 'Cancelled', NOW(), ?, ?)
      `;

      db.query(insertOrderStatusQuery, [orderID, cancellationReason, employeeID], (err) => {
        if (err) {
          console.error("Error updating order status to cancelled:", err);
          return db.rollback(() => res.status(500).send("Error updating order status to cancelled"));
        }

        // Retrieve order items to replenish subinventory
        const getOrderItemsQuery = `
          SELECT oi.productID, oi.quantity AS orderQuantity, s.inventoryID, s.quantityNeeded
          FROM orderitem oi
          JOIN subitem s ON s.productID = oi.productID
          WHERE oi.orderID = ?
        `;

        db.query(getOrderItemsQuery, [orderID], (err, orderItems) => {
          if (err) {
            console.error("Error fetching order items:", err);
            return db.rollback(() => res.status(500).send("Error fetching order items"));
          }

          // Iterate through each order item to replenish subinventory
          const replenishSubinventory = (inventoryID, quantityToReplenish) => {
            return new Promise((resolve, reject) => {
              const getSubinventoryQuery = `
                SELECT 
                  si.subinventoryID, 
                  si.quantityRemaining, 
                  poi.quantityOrdered, 
                  poi.expiryDate
                FROM 
                  subinventory si
                JOIN 
                  purchaseorderitem poi 
                ON 
                  si.subinventoryID = poi.purchaseOrderItemID
                WHERE 
                  si.inventoryID = ?
                ORDER BY 
                  CASE WHEN si.quantityRemaining = 0 THEN 1 ELSE 0 END, 
                  poi.expiryDate ASC;
              `;

              db.query(getSubinventoryQuery, [inventoryID], (err, subinventories) => {
                if (err) return reject(err);

                if (subinventories.length === 0) {
                  console.warn(`No subinventory found for inventoryID: ${inventoryID}`);
                  return resolve();
                }

                let remainingQuantity = quantityToReplenish;

                // Iterate over subinventories to update quantities
                const updatePromises = subinventories.map((subinventory, index) => {
                  return new Promise((innerResolve, innerReject) => {
                    if (remainingQuantity <= 0) return innerResolve(); // No more replenishment needed

                    const { subinventoryID, quantityRemaining, quantityOrdered } = subinventory;

                    // Calculate how much can be replenished into this subinventory
                    const replenishable = quantityOrdered - quantityRemaining;
                    const replenishQuantity = Math.min(remainingQuantity, replenishable);

                    if (replenishQuantity > 0) {
                      const updateSubinventoryQuery = `
                        UPDATE subinventory
                        SET quantityRemaining = quantityRemaining + ?
                        WHERE subinventoryID = ?
                      `;
                      db.query(updateSubinventoryQuery, [replenishQuantity, subinventoryID], (err) => {
                        if (err) return innerReject(err);

                        console.log(`Replenished ${replenishQuantity} to subinventoryID: ${subinventoryID}`);
                        remainingQuantity -= replenishQuantity;
                        innerResolve();
                      });
                    } else {
                      innerResolve();
                    }
                  });
                });

                // Handle excess stock by adding it to the subinventory with the latest expiry date
                Promise.all(updatePromises).then(() => {
                  if (remainingQuantity > 0) {
                    const latestExpirySubinventory = subinventories
                      .filter((si) => si.quantityRemaining === 0)
                      .sort((a, b) => new Date(b.expiryDate) - new Date(a.expiryDate))[0];

                    if (latestExpirySubinventory) {
                      const { subinventoryID } = latestExpirySubinventory;

                      const updateExcessQuery = `
                        UPDATE subinventory
                        SET quantityRemaining = quantityRemaining + ?
                        WHERE subinventoryID = ?
                      `;
                      db.query(updateExcessQuery, [remainingQuantity, subinventoryID], (err) => {
                        if (err) return reject(err);

                        console.log(
                          `Excess of ${remainingQuantity} added to subinventoryID: ${subinventoryID}`
                        );
                        resolve();
                      });
                    } else {
                      console.warn(`No subinventory with quantityRemaining = 0 for inventoryID: ${inventoryID}`);
                      resolve();
                    }
                  } else {
                    resolve();
                  }
                });
              });
            });
          };

          const updateSubinventoryPromises = orderItems.map((item) =>
            replenishSubinventory(item.inventoryID, item.orderQuantity * item.quantityNeeded)
          );

          Promise.all(updateSubinventoryPromises)
            .then(() => {
              db.commit((err) => {
                if (err) {
                  console.error("Error committing transaction:", err);
                  return db.rollback(() => res.status(500).send("Error committing transaction"));
                }

                console.log("Order cancellation and inventory replenishment committed successfully.");
                res.status(200).send("Order cancelled and inventory replenished successfully");
              });
            })
            .catch((err) => {
              console.error("Error in replenishment process:", err);
              db.rollback(() => res.status(500).send("Error in replenishment process"));
            });
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
      os.orderID,
      os.orderStatus,
      os.statusDateTime
    FROM 
      payment p
    LEFT JOIN 
      discount d ON p.paymentID = d.discountID
    JOIN 
      orderstatus os ON p.orderStatusID = os.orderStatusID
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