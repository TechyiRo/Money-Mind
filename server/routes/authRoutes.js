const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteAccount,
  googleAuth,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});

router.post('/register', apiLimiter, registerUser);
router.post('/login', apiLimiter, loginUser);
router.post('/google', apiLimiter, googleAuth);
router.post('/logout', logoutUser);

router.get('/me', protect, getUserProfile);
router.put('/update-profile', protect, updateUserProfile);
router.put('/change-password', protect, changePassword);
router.delete('/delete-account', protect, deleteAccount);

module.exports = router;
