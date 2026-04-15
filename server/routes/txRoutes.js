const express = require('express');
const router = express.Router();
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  deleteBulkTransactions,
  createBulkTransactions,
  exportTransactions
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getTransactions)
  .post(protect, createTransaction);

router.get('/export', protect, exportTransactions);
router.route('/bulk', protect)
  .post(protect, createBulkTransactions)
  .delete(protect, deleteBulkTransactions);

router.route('/:id')
  .put(protect, updateTransaction)
  .delete(protect, deleteTransaction);

module.exports = router;
