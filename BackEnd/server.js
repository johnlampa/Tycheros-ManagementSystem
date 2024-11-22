const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000", // Frontend origin
    credentials: true, // Allow cookies
  }));

// Route imports
const employeeRoutes = require('./routes/employeeManagementRoutes');
const inventoryRoutes = require('./routes/inventoryManagementRoutes');
const menuRoutes = require('./routes/menuManagementRoutes');
const orderingRoutes = require('./routes/orderingRoutes');
const orderRoutes = require('./routes/orderManagementRoutes');
const loginRoutes = require('./routes/loginRoutes');

// Route usage
app.use('/employeeManagement', employeeRoutes);
app.use('/inventoryManagement', inventoryRoutes);
app.use('/menuManagement', menuRoutes);
app.use('/ordering', orderingRoutes);
app.use('/orderManagement', orderRoutes);
app.use('/login', loginRoutes);

// LISTEN LISTEN LISTEN LISTEN LISTEN PAMINAW BA
app.listen(8081, () => {
    console.log("listening");
    });