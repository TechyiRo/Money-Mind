const express = require('express');
const router = express.Router();
const {
  getUdhari,
  createUdhari,
  updateUdhari,
  settleUdhari,
  deleteUdhari
} = require('../controllers/udhariController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getUdhari)
  .post(protect, createUdhari);

router.route('/:id')
  .put(protect, updateUdhari)
  .delete(protect, deleteUdhari);

router.patch('/:id/settle', protect, settleUdhari);

module.exports = router;
