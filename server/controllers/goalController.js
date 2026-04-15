const Goal = require('../models/Goal');

// @desc    Get all goals
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res) => {
  try {
    const { name, targetAmount, targetDate, emoji } = req.body;

    const goal = new Goal({
      userId: req.user._id,
      name,
      targetAmount,
      targetDate,
      emoji
    });

    const savedGoal = await goal.save();
    res.status(201).json(savedGoal);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const { name, targetAmount, targetDate, emoji } = req.body;

    goal.name = name || goal.name;
    goal.targetAmount = targetAmount !== undefined ? targetAmount : goal.targetAmount;
    goal.targetDate = targetDate || goal.targetDate;
    goal.emoji = emoji || goal.emoji;

    if (goal.savedAmount >= goal.targetAmount && !goal.isCompleted) {
      goal.isCompleted = true;
      goal.completedAt = new Date();
    } else if (goal.savedAmount < goal.targetAmount && goal.isCompleted) {
      goal.isCompleted = false;
      goal.completedAt = null;
    }

    const updatedGoal = await goal.save();
    res.json(updatedGoal);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add funds to a goal
// @route   POST /api/goals/:id/add-funds
// @access  Private
const addFundsToGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const { amount } = req.body;
    
    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than zero' });
    }

    goal.savedAmount += amount;
    
    if (goal.savedAmount >= goal.targetAmount && !goal.isCompleted) {
      goal.isCompleted = true;
      goal.completedAt = new Date();
    }

    const updatedGoal = await goal.save();
    res.json(updatedGoal);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    await Goal.deleteOne({ _id: req.params.id });
    res.json({ message: 'Goal removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  addFundsToGoal,
  deleteGoal
};
