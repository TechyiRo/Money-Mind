const express = require('express');
const router = express.Router();
const {
  getMonthlySummary,
  getCategoryBreakdown,
  getSpendingTrend,
  getWeeklyAnalysis,
  exportPdf
} = require('../controllers/reportsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/monthly-summary', protect, getMonthlySummary);
router.get('/category-breakdown', protect, getCategoryBreakdown);
router.get('/spending-trend', protect, getSpendingTrend);
router.get('/weekly-analysis', protect, getWeeklyAnalysis);
router.get('/export-pdf', protect, exportPdf);

module.exports = router;
