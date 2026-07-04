const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./db');
const apiRoutes = require('./routes/APIRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and body parsing middleware
app.use(cors());
app.use(express.json());

// Initialize Database connection
connectDB();

// Mount main routing middleware
app.use('/api', apiRoutes);

// Root entry path healthcheck
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'API Creator Gateway is active.' });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`🚀 Gateway Server running at http://localhost:${PORT}`);
  console.log(`📡 Dynamic Execution Path: http://localhost:${PORT}/api/run/*`);
});
