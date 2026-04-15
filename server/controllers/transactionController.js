const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// @desc    Get all transactions (paginated, filterable, sortable)
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { type, category, startDate, endDate, search, sort } = req.query;

    let query = { userId: new mongoose.Types.ObjectId(req.user._id) };

    if (type) query.type = type;
    if (category) query.category = category;
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }

    let sortOption = { date: -1 }; // Default sort by date descending
    if (sort === 'date_asc') sortOption = { date: 1 };
    if (sort === 'amount_desc') sortOption = { amount: -1 };
    if (sort === 'amount_asc') sortOption = { amount: 1 };

    const transactions = await Transaction.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments(query);

    // Dynamic stats aggregation for the selected period
    const stats = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const statsObj = {
      income: stats.find(s => s._id === 'income')?.totalAmount || 0,
      expense: stats.find(s => s._id === 'expense')?.totalAmount || 0
    };

    res.json({
      transactions,
      page,
      pages: Math.ceil(total / limit),
      total,
      stats: statsObj
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
  try {
    const { type, amount, category, date, description, isRecurring, recurringFrequency, tags } = req.body;

    const transaction = new Transaction({
      userId: req.user._id,
      type,
      amount,
      category,
      date,
      description,
      isRecurring,
      recurringFrequency,
      tags,
    });

    const savedTransaction = await transaction.save();
    res.status(201).json(savedTransaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const { type, amount, category, date, description, isRecurring, recurringFrequency, tags } = req.body;

    transaction.type = type || transaction.type;
    transaction.amount = amount !== undefined ? amount : transaction.amount;
    transaction.category = category || transaction.category;
    transaction.date = date || transaction.date;
    transaction.description = description !== undefined ? description : transaction.description;
    transaction.isRecurring = isRecurring !== undefined ? isRecurring : transaction.isRecurring;
    transaction.recurringFrequency = recurringFrequency || transaction.recurringFrequency;
    transaction.tags = tags || transaction.tags;

    const updatedTransaction = await transaction.save();
    res.json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    await Transaction.deleteOne({ _id: req.params.id });
    res.json({ message: 'Transaction removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Bulk delete transactions
// @route   DELETE /api/transactions/bulk
// @access  Private
const deleteBulkTransactions = async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No transaction IDs provided' });
    }

    await Transaction.deleteMany({
      _id: { $in: ids },
      userId: req.user._id
    });

    res.json({ message: 'Transactions removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Export transactions to CSV
// @route   GET /api/transactions/export
// @access  Private
const exportTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id }).sort({ date: -1 });
    
    // Create CSV header
    let csv = 'Date,Type,Category,Description,Amount,Tags\n';
    
    // Add rows
    transactions.forEach(t => {
      const date = new Date(t.date).toLocaleDateString();
      const tags = t.tags ? t.tags.join(';') : '';
      const desc = t.description ? `"${t.description.replace(/"/g, '""')}"` : '';
      csv += `${date},${t.type},${t.category},${desc},${t.amount},"${tags}"\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('transactions.csv');
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Bulk create transactions
// @route   POST /api/transactions/bulk
// @access  Private
const createBulkTransactions = async (req, res) => {
  try {
    const { transactions } = req.body;
    
    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ message: 'No transactions provided' });
    }

    const txsToSave = transactions.map(t => ({
      userId: req.user._id,
      type: t.type,
      amount: t.amount,
      category: t.category,
      date: t.date,
      description: t.description,
      tags: t.tags || []
    }));

    const result = await Transaction.insertMany(txsToSave);
    res.status(201).json({ 
      message: `${result.length} transactions imported successfully`,
      count: result.length 
    });
  } catch (error) {
    console.error('Bulk Import Error:', error);
    res.status(500).json({ 
      message: 'Bulk import failed', 
      error: error.message,
      details: error.errors ? Object.keys(error.errors).map(k => `${k}: ${error.errors[k].message}`) : []
    });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  deleteBulkTransactions,
  createBulkTransactions,
  exportTransactions
};
