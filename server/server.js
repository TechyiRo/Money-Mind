require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Route files
const authRoutes = require('./routes/authRoutes');
const txRoutes = require('./routes/txRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const goalRoutes = require('./routes/goalRoutes');
const udhariRoutes = require('./routes/udhariRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Connect Database
connectDB();

const app = express();

// Security and middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', txRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/udhari', udhariRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => {
  res.send('MoneyMind AI API is running...');
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
