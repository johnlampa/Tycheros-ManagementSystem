const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "AdDU2202201425196", // Change pw
  database: "tycherosdb"
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database.');
});

// Login Route
router.post('/login', (req, res) => {
  const { employeeID, password } = req.body;

  if (!employeeID || !password) {
    return res.status(400).json({ message: "All fields are required"});
  }

  const query = "SELECT * FROM employees WHERE employeeID = ? LIMIT 1";
  db.query(query, [employeeID], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal Server Error"});
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Employee not found"});
    }

    const employee = results[0];

    if (employee.password !== password) {
      return res.status(401).json({ message: "Incorrect password"});
    }

    // Successful login
    return res.status(200).json({ message: "Login successful", employee });
  });
});

module.exports = router;
