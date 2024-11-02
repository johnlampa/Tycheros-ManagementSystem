// routes/employeeManagementRoutes.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Fifteen15", // Change pw
  database: "tycherosdb"
});

// EMPLOYEE MANAGEMENT ENDPOINTS

// READ ENDPOINT
router.get('/getEmployee', (req, res) => {
  const query = "SELECT * FROM employees";

  db.query(query, (err, data) => {
    if (err) return res.status(500).json({ error: "Internal Server Error" });
    return res.json(data);
  });
});

// CREATE ENDPOINT
router.post('/postEmployee', (req, res) => {
  const employeeData = req.body;
  const employee = {
    firstName: employeeData.firstName, 
    lastName: employeeData.lastName,
    designation: employeeData.designation,
    status: employeeData.status,
    contactInformation: employeeData.contactInformation,
    password: employeeData.password,
  };

  db.query("INSERT INTO employees SET ?", employee, (err, employeeResult) => {
    if (err) {
      console.error("Error adding employee:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    return res.json({ message: "Employee added successfully", employeeID: employeeResult.insertId });
  });
});

// UPDATE ENDPOINT
router.put('/putEmployee/:employeeID', (req, res) => {
  const employeeID = req.params.employeeID;
  const employeeData = req.body;

  let fields = [];
  let values = [];

  if (employeeData.firstName) {
    fields.push("firstName = ?");
    values.push(employeeData.firstName);
  }
  if (employeeData.lastName) {
    fields.push("lastName = ?");
    values.push(employeeData.lastName);
  }
  if (employeeData.designation) {
    fields.push("designation = ?");
    values.push(employeeData.designation);
  }
  if (employeeData.status) {
    fields.push("status = ?");
    values.push(employeeData.status);
  }
  if (employeeData.contactInformation) {
    fields.push("contactInformation = ?");
    values.push(employeeData.contactInformation);
  }
  if (employeeData.password) {
    fields.push("password = ?");
    values.push(employeeData.password);
  }

  values.push(employeeID);

  const query = `
    UPDATE employees 
    SET ${fields.join(", ")}
    WHERE employeeID = ?
  `;

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Error updating employee:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    return res.json({ message: "Employee updated successfully" });
  });
});

// DELETE ENDPOINT
router.delete('/deleteEmployee/:employeeID', (req, res) => {
  const employeeID = req.params.employeeID;

  const query = `
    DELETE FROM employees 
    WHERE employeeID = ?
  `;

  db.query(query, [employeeID], (err, result) => {
    if (err) {
      console.error("Error deleting employee:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    return res.json({ message: "Employee deleted successfully" });
  });
});

module.exports = router;
