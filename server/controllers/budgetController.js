const Budget = require('../models/Budget');

// @desc    Get all budgets
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user._id });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a budget
// @route   POST /api/budgets
// @access  Private
const createBudget = async (req, res) => {
  try {
    const { category, monthlyLimit, month } = req.body;

    const existingBudget = await Budget.findOne({ userId: req.user._id, category, month });
    
    if (existingBudget) {
      return res.status(400).json({ message: 'Budget for this category and month already exists' });
    }

    const budget = new Budget({
      userId: req.user._id,
      category,
      monthlyLimit,
      month
    });

    const savedBudget = await budget.save();
    res.status(201).json(savedBudget);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a budget
// @route   PUT /api/budgets/:id
// @access  Private
const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, userId: req.user._id });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    const { monthlyLimit } = req.body;
    budget.monthlyLimit = monthlyLimit !== undefined ? monthlyLimit : budget.monthlyLimit;

    const updatedBudget = await budget.save();
    res.json(updatedBudget);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, userId: req.user._id });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    await Budget.deleteOne({ _id: req.params.id });
    res.json({ message: 'Budget removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget
};
