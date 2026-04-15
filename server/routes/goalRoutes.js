const express = require('express');
const router = express.Router();
const {
  getGoals,
  createGoal,
  updateGoal,
  addFundsToGoal,
  deleteGoal
} = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getGoals)
  .post(protect, createGoal);

router.route('/:id')
  .put(protect, updateGoal)
  .delete(protect, deleteGoal);

router.post('/:id/add-funds', protect, addFundsToGoal);

module.exports = router;
