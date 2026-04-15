const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

// @desc    Get monthly summary
// @route   GET /api/reports/monthly-summary
// @access  Private
const getMonthlySummary = async (req, res) => {
  try {
    let { month, year } = req.query;
    
    // Default to current month if not provided
    if (!month || !year) {
      const now = new Date();
      month = String(now.getMonth() + 1).padStart(2, '0');
      year = String(now.getFullYear());
    }

    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59);
    
    const query = { 
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    };

    const transactions = await Transaction.find(query);

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
      if (t.type === 'income') totalIncome += t.amount;
      if (t.type === 'expense') totalExpense += t.amount;
    });

    // Fetch Total Budget for this period
    const monthStr = `${year}-${month}`;
    const budgets = await Budget.find({ userId: req.user._id, month: monthStr });
    const totalBudget = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);

    res.json({
      totalIncome,
      totalExpense,
      totalBudget,
      remainingBudget: totalBudget - totalExpense,
      netBalance: totalIncome - totalExpense,
      transactionsCount: transactions.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get category breakdown for a year or month
// @route   GET /api/reports/category-breakdown
// @access  Private
const getCategoryBreakdown = async (req, res) => {
  try {
    const { year, month } = req.query;
    
    let match = {
      userId: req.user._id,
      type: 'expense'
    };

    if (year) {
      if (month) {
        const startDate = new Date(`${year}-${month}-01`);
        const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59);
        match.date = { $gte: startDate, $lte: endDate };
      } else {
        const startDate = new Date(`${year}-01-01`);
        const endDate = new Date(`${year}-12-31T23:59:59`);
        match.date = { $gte: startDate, $lte: endDate };
      }
    }

    const expenses = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get spending trend (last 12 months)
// @route   GET /api/reports/spending-trend
// @access  Private
const getSpendingTrend = async (req, res) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 11);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const trend = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json(trend);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get detailed weekly analysis
// @route   GET /api/reports/weekly-analysis
// @access  Private
const getWeeklyAnalysis = async (req, res) => {
  try {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    const weeklyData = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            week: { $week: "$date" },
            type: "$type"
          },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.week": 1 } }
    ]);

    res.json(weeklyData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Export PDF
// @route   GET /api/reports/export-pdf
// @access  Private
const exportPdf = async (req, res) => {
  res.json({ message: 'PDF generated via frontend using jsPDF, use frontend export' });
};

module.exports = {
  getMonthlySummary,
  getCategoryBreakdown,
  getSpendingTrend,
  getWeeklyAnalysis,
  exportPdf
};
