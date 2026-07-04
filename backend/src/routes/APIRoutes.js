const express = require('express');
const router = express.Router();

const {
  getAPIs,
  getAPIById,
  createAPI,
  updateAPI,
  deleteAPI,
  runDynamicAPI
} = require('../controllers/APIController');

const {
  getLogs,
  clearLogs,
  getStats
} = require('../controllers/LogController');

// --- 1. Dynamic API CRUD Configurations ---
router.get('/workflows', getAPIs);
router.get('/workflows/:id', getAPIById);
router.post('/workflows', createAPI);
router.put('/workflows/:id', updateAPI);
router.delete('/workflows/:id', deleteAPI);

// --- 2. History Logs & Metrics ---
router.get('/logs', getLogs);
router.delete('/logs', clearLogs);
router.get('/stats', getStats);

// --- 3. Simulated Downstream Mock APIs (Exactly 2 Method-Aware Routes) ---

// Mock Endpoint A
router.all('/mock/first', (req, res) => {
  const method = req.method.toUpperCase();
  const params = method === 'GET' ? req.query : req.body;
  
  return res.status(200).json({
    vendor: 'Downstream Service A',
    methodUsed: method,
    status: 'VERIFIED',
    processedValue: params.inputValue ? params.inputValue.toUpperCase() : 'NO_VALUE_PROVIDED',
    timestamp: new Date().toISOString()
  });
});

// Mock Endpoint B
router.all('/mock/second', (req, res) => {
  const method = req.method.toUpperCase();
  const params = method === 'GET' ? req.query : req.body;
  
  return res.status(200).json({
    vendor: 'Downstream Service B',
    methodUsed: method,
    lookupCode: params.referenceValue ? `REF-${params.referenceValue.toUpperCase()}` : 'REF-NONE',
    creditScore: 780,
    activeRegistration: true
  });
});

// --- 4. Dynamic Run Route Catch-All Gateway ---
router.all('/run/*', runDynamicAPI);

module.exports = router;
