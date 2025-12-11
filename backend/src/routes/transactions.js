const express = require('express');
const router = express.Router();
const { getAllTransactions, getStatistics } = require('../controllers/transactionController');

// Define the links
router.get('/', getAllTransactions);       // GET /api/transactions
router.get('/stats', getStatistics);       // GET /api/transactions/stats

module.exports = router;
