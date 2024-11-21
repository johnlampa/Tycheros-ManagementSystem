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

// GET INVENTORY Details by Inventory ID Configured
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
    console.error("Error fetching inventory item details:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ADD INVENTORY ITEM ENDPOINT Configured
router.post('/postInventoryItem', async (req, res) => {
  const { inventoryName, inventoryCategory, unitOfMeasurementID, reorderPoint, inventoryStatus } = req.body;

  const newInventoryItem = {
    inventoryName,
    inventoryCategory,
    unitOfMeasurementID,
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

// UPDATE SUBINVENTORY ENDPOINT
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
    res.json({ message: "Inventory item updated successfully" });
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
    SELECT 
      uom.unitOfMeasurementID, 
      uom.UoM, 
      uom.type, 
      uom.ratio, 
      uom.status, 
      category.categoryName AS category,
      \`system\`.system AS systemName
    FROM 
      unitofmeasurement uom
    JOIN 
      category ON uom.categoryID = category.categoryID
    JOIN 
      \`system\` ON category.systemID = \`system\`.systemID
    WHERE 
      uom.categoryID = (
        SELECT uom2.categoryID
        FROM unitofmeasurement uom2
        JOIN inventory inv ON inv.unitOfMeasurementID = uom2.unitOfMeasurementID
        WHERE inv.inventoryID = ?
      ) AND uom.status = 1
  `;

  try {
    const [rows] = await pool.query(query, [inventoryID]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching UoMs by category:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// STOCK IN ENDPOINT CONFIGURED
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
    console.error('Error stocking in items:', err);
    res.status(500).send(err);
  } finally {
    connection.release();
  }
});

router.post('/stockOutInventoryItem', async (req, res) => {
  const { inventoryItems, stockOutDateTime, employeeID } = req.body; // Assume an array of inventory items with quantities and reasons

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    for (const item of inventoryItems) {
      const { inventoryID, quantityToStockOut, reason } = item;
      let remainingQuantity = quantityToStockOut;

      // Find subinventory entries for the given inventoryID, ordered by the oldest expiry date
      const [subinventoryEntries] = await connection.query(`
        SELECT si.subinventoryID, si.quantityRemaining, poi.expiryDate
        FROM subinventory si
        JOIN purchaseorderitem poi ON si.subinventoryID = poi.purchaseOrderItemID
        WHERE si.inventoryID = ? AND si.quantityRemaining > 0
        ORDER BY poi.expiryDate ASC
      `, [inventoryID]);

      for (const entry of subinventoryEntries) {
        if (remainingQuantity <= 0) break;

        const deductQuantity = Math.min(entry.quantityRemaining, remainingQuantity);

        // Update the quantityRemaining in subinventory
        await connection.query(`
          UPDATE subinventory
          SET quantityRemaining = quantityRemaining - ?
          WHERE subinventoryID = ?
        `, [deductQuantity, entry.subinventoryID]);

        remainingQuantity -= deductQuantity;

        // Insert a record into the stockout table
        await connection.query(`
          INSERT INTO stockout (subinventoryID, quantity, reason, stockOutDateTime, employeeID)
          VALUES (?, ?, ?, ?, ?)
        `, [entry.subinventoryID, deductQuantity, reason, stockOutDateTime, employeeID]);
      }

      if (remainingQuantity > 0) {
        throw new Error(`Not enough stock available in inventoryID ${inventoryID} to complete the stock-out.`);
      }
    }

    await connection.commit();
    res.status(201).send('Stock-out recorded successfully for all items');
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
      uom.unitOfMeasurementID, 
      uom.UoM, 
      uom.type, 
      uom.ratio, 
      uom.status, 
      category.categoryName AS category,
      \`system\`.system AS systemName
    FROM 
      unitofmeasurement uom
    JOIN 
      category ON uom.categoryID = category.categoryID
    JOIN 
      \`system\` ON category.systemID = \`system\`.systemID
    WHERE 
      uom.type = 'reference' AND uom.status = 1
  `;

  try {
    const [result] = await pool.query(query);
    res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching reference units:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /getCategoriesBySystem
router.get('/getCategoriesBySystem/:systemName', async (req, res) => {
  const { systemName } = req.params;

  const query = `
    SELECT 
      c.categoryID,
      c.categoryName,
      c.status,
      s.system AS systemName
    FROM 
      category c
    JOIN 
      \`system\` s ON c.systemID = s.systemID
    WHERE 
      s.system = ?
  `;

  try {
    const [results] = await pool.query(query, [systemName]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'No categories found for the specified system' });
    }

    res.status(200).json(results);
  } catch (err) {
    console.error('Error fetching categories by system:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /getUoMsWithCategories
router.get('/getUoMsWithCategories', async (req, res) => {
  const query = `
    SELECT 
      uom.unitOfMeasurementID,
      uom.categoryID,
      uom.UoM,
      uom.type,
      uom.ratio,
      uom.status,
      c.categoryName,
      c.status AS categoryStatus
    FROM 
      unitofmeasurement uom
    JOIN 
      category c ON uom.categoryID = c.categoryID
    ORDER BY 
      c.categoryName ASC, uom.unitOfMeasurementID ASC
  `;

  try {
    const [result] = await pool.query(query);
    res.status(200).json(result);
  } catch (err) {
    console.error('Error fetching UoMs with categories:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/addUoMCategory', async (req, res) => {
  const { categoryName, systemName, referenceUOMName, status } = req.body;

  console.log("Received request:", req.body);

  if (!categoryName || !systemName) {
    console.error("Missing required fields");
    return res
      .status(400)
      .json({ error: "Category name and system name are required" });
  }

  try {
    // Check if the system exists
    const checkSystemQuery = `
      SELECT systemID FROM \`system\` WHERE \`system\` = ?
    `;
    const [systemResult] = await pool.query(checkSystemQuery, [systemName]);

    let systemID;

    if (systemResult.length > 0) {
      // System exists
      systemID = systemResult[0].systemID;
    } else {
      // Insert new system
      const insertSystemQuery = `
        INSERT INTO \`system\` (\`system\`)
        VALUES (?)
      `;
      const [insertSystemResult] = await pool.query(insertSystemQuery, [
        systemName,
      ]);
      console.log("Inserted new system:", insertSystemResult);
      systemID = insertSystemResult.insertId;
    }

    // Insert the category
    const insertCategoryQuery = `
      INSERT INTO category (categoryName, systemID, status)
      VALUES (?, ?, ?)
    `;
    const [categoryResult] = await pool.query(insertCategoryQuery, [
      categoryName,
      systemID,
      status || 1,
    ]);
    const categoryID = categoryResult.insertId;
    console.log("Inserted category with ID:", categoryID);

    // Insert the UOM if provided
    if (referenceUOMName) {
      const insertUOMQuery = `
        INSERT INTO unitofmeasurement (categoryID, UoM, type, ratio, status)
        VALUES (?, ?, 'reference', 1.0, ?)
      `;
      const [uomResult] = await pool.query(insertUOMQuery, [
        categoryID,
        referenceUOMName,
        status || 1,
      ]);
      console.log("Inserted UOM with ID:", uomResult.insertId);

      return res.status(201).json({
        message: "Category and reference UOM added successfully",
        categoryID: categoryID,
        unitOfMeasurementID: uomResult.insertId,
      });
    }

    return res.status(201).json({
      message: "Category added successfully without reference UOM",
      categoryID: categoryID,
    });
  } catch (err) {
    console.error("Error in /addUoMCategory:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put('/updateUoMCategory/:categoryID', async (req, res) => {
  const { categoryID } = req.params;
  const { categoryName, status } = req.body;

  console.log("Category ID:", categoryID);
  console.log("Request Body:", req.body);

  if (!categoryName && status === undefined) {
    return res.status(400).json({
      error: 'At least one of categoryName or status must be provided',
    });
  }

  try {
    const updateCategoryQuery = `
      UPDATE category
      SET 
        categoryName = COALESCE(?, categoryName),
        status = COALESCE(?, status)
      WHERE categoryID = ?
    `;
    const [result] = await pool.query(updateCategoryQuery, [
      categoryName || null,
      status !== undefined ? status : null,
      categoryID,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(200).json({ message: 'Category updated successfully' });
  } catch (err) {
    console.error('Error in /updateUoMCategory:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/addUoM', async (req, res) => {
  const { categoryID, UOMName, ratio, status } = req.body;

  if (!categoryID || !UOMName || ratio === undefined) {
    return res.status(400).json({ error: 'Category ID, UOM Name, and Ratio are required' });
  }

  try {
    // Determine the `type` based on the ratio
    let type = '';
    if (ratio >= 1) {
      type = 'bigger';
    } else if (ratio > 0) {
      type = 'smaller';
    } else {
      return res.status(400).json({ error: 'Ratio must be greater than 0' });
    }

    // Insert the UoM into the database
    const insertUOMQuery = `
      INSERT INTO unitofmeasurement (categoryID, UoM, type, ratio, status)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(insertUOMQuery, [
      categoryID,
      UOMName,
      type,
      ratio,
      status || 1, // Default status to 1 (active) if not provided
    ]);

    return res.status(201).json({
      message: 'Unit of Measurement added successfully',
      unitOfMeasurementID: result.insertId,
    });
  } catch (err) {
    console.error('Error adding UoM:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/editUoM/:unitOfMeasurementID', async (req, res) => {
  const { unitOfMeasurementID } = req.params;
  const { UOMName, ratio, status } = req.body;

  // Validate inputs
  if (!UOMName || ratio === undefined || status === undefined) {
    return res
      .status(400)
      .json({ error: 'UOM Name, Ratio, and Status are required' });
  }

  try {
    // Determine the `type` based on the ratio
    let type = '';
    if (ratio >= 1) {
      type = 'bigger';
    } else if (ratio > 0) {
      type = 'smaller';
    } else {
      return res
        .status(400)
        .json({ error: 'Ratio must be greater than 0' });
    }

    // Update the UoM in the database
    const updateUOMQuery = `
      UPDATE unitofmeasurement
      SET 
        UoM = ?,
        ratio = ?,
        type = ?,
        status = ?
      WHERE unitOfMeasurementID = ?
    `;

    const [result] = await pool.query(updateUOMQuery, [
      UOMName,
      ratio,
      type,
      status,
      unitOfMeasurementID,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Unit of Measurement not found' });
    }

    return res.status(200).json({
      message: 'Unit of Measurement updated successfully',
    });
  } catch (err) {
    console.error('Error updating UoM:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/getStockInRecords', async (req, res) => {
  const query = `
    SELECT 
        po.purchaseOrderID,
        po.stockInDateTime,
        e.firstName AS employeeFirstName,
        e.lastName AS employeeLastName,
        s.supplierName,
        poi.purchaseOrderItemID,
        poi.quantityOrdered,
        poi.pricePerPOUoM,
        poi.expiryDate,
        uom.UoM AS unitOfMeasurement,
        inv.inventoryName AS purchaseOrderItemName
    FROM 
        purchaseorder po
    LEFT JOIN 
        employees e ON po.employeeID = e.employeeID
    LEFT JOIN 
        supplier s ON po.supplierID = s.supplierID
    LEFT JOIN 
        purchaseorderitem poi ON po.purchaseOrderID = poi.purchaseOrderID
    LEFT JOIN 
        subinventory si ON si.subinventoryID = poi.purchaseOrderItemID -- Join with subinventory
    LEFT JOIN 
        inventory inv ON si.inventoryID = inv.inventoryID -- Join subinventory to inventory
    LEFT JOIN 
        unitofmeasurement uom ON poi.unitOfMeasurementID = uom.unitOfMeasurementID
    ORDER BY 
        po.purchaseOrderID ASC, 
        poi.expiryDate ASC;
  `;

  try {
    const [results] = await pool.query(query);

    // Group data by purchaseOrderID
    const groupedData = results.reduce((acc, row) => {
      let record = acc.find(item => item.purchaseOrderID === row.purchaseOrderID);
      if (!record) {
        record = {
          purchaseOrderID: row.purchaseOrderID,
          stockInDateTime: row.stockInDateTime,
          employeeFirstName: row.employeeFirstName,
          employeeLastName: row.employeeLastName,
          supplierName: row.supplierName,
          purchaseOrderItems: []
        };
        acc.push(record);
      }

      record.purchaseOrderItems.push({
        purchaseOrderItemID: row.purchaseOrderItemID,
        quantityOrdered: row.quantityOrdered,
        pricePerPOUoM: row.pricePerPOUoM,
        expiryDate: row.expiryDate,
        unitOfMeasurement: row.unitOfMeasurement,
        purchaseOrderItemName: row.purchaseOrderItemName
      });

      return acc;
    }, []);

    res.status(200).json(groupedData);
  } catch (err) {
    console.error('Error fetching purchase orders:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/getStockOutRecords', async (req, res) => {
  const query = `
    SELECT 
      DATE(so.stockOutDateTime) AS stockOutDate,
      so.stockOutDateTime,
      e.firstName AS employeeFirstName,
      e.lastName AS employeeLastName,
      i.inventoryName AS stockOutItemName,
      CAST(so.reason AS CHAR) AS reason, -- Convert reason from BLOB to CHAR
      so.quantity,
      uom.UoM AS unitOfMeasurement
    FROM 
      stockout so
    JOIN 
      subinventory si ON so.subinventoryID = si.subinventoryID
    JOIN 
      inventory i ON si.inventoryID = i.inventoryID
    JOIN 
      employees e ON so.employeeID = e.employeeID
    JOIN 
      unitofmeasurement uom ON i.unitOfMeasurementID = uom.unitOfMeasurementID
    ORDER BY 
      so.stockOutDateTime DESC;
  `;

  try {
    const [results] = await pool.query(query);

    const groupedStockOutRecords = results.reduce((acc, record) => {
      const dateKey = record.stockOutDate;

      if (!acc[dateKey]) {
        acc[dateKey] = {
          stockOutDate: dateKey,
          stockOutDateTime: record.stockOutDateTime,
          employeeFirstName: record.employeeFirstName,
          employeeLastName: record.employeeLastName,
          stockOutItems: [],
        };
      }

      acc[dateKey].stockOutItems.push({
        stockOutItemName: record.stockOutItemName,
        reason: record.reason, // Now it's a readable string
        quantity: record.quantity,
        unitOfMeasurement: record.unitOfMeasurement,
      });

      return acc;
    }, {});

    const groupedStockOutArray = Object.values(groupedStockOutRecords);

    res.status(200).json(groupedStockOutArray);
  } catch (err) {
    console.error('Error fetching stock out records:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;