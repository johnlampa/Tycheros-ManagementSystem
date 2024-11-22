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
    return res.status(400).json({ message: "All fields are required" });
  }

  const query = "SELECT employeeID, password, designation, status FROM employees WHERE employeeID = ? LIMIT 1";
  db.query(query, [employeeID], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const employee = results[0];

    if (employee.password !== password) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    if (employee.status !== "Active") {
      return res.status(403).json({ message: `Access denied: ${employee.status} status` });
    }

    // Successful login: Set a secure cookie
    res.cookie("loggedInEmployeeID", employee.employeeID, {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS
      maxAge: 3600000, // 1 hour
      sameSite: "strict",
    });

    res.cookie("designation", employee.designation, {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS
      maxAge: 3600000, // 1 hour
      sameSite: "strict",
    });

    return res.status(200).json({
      message: "Login successful",
      employee: {
        employeeID: employee.employeeID,
        designation: employee.designation,
        status: employee.status
      }
    });
  });
});

// Logout Route
router.post('/logout', (req, res) => {
  // Clear cookies
  res.clearCookie("loggedInEmployeeID");
  res.clearCookie("designation");

  return res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;
