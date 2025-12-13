const express = require('express');
const router = express.Router();
const { getAllTransactions, getStatistics, getMeta, debugAge } = require('../controllers/transactionController');

// Define the links
router.get('/', getAllTransactions);       // GET /api/transactions
router.get('/stats', getStatistics);       // GET /api/transactions/stats
router.get('/meta', getMeta);              // GET /api/transactions/meta
router.get('/debug-age', debugAge);

module.exports = router;
