const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { OAuth2Client } = require('google-auth-library');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, monthlyIncome } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      monthlyIncome: monthlyIncome || 0,
    });

    if (user) {
      generateToken(res, user._id);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        monthlyIncome: user.monthlyIncome,
        currency: user.currency,
        language: user.language,
        theme: user.theme,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      generateToken(res, user._id);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        monthlyIncome: user.monthlyIncome,
        currency: user.currency,
        language: user.language,
        theme: user.theme,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        monthlyIncome: user.monthlyIncome,
        currency: user.currency,
        language: user.language,
        theme: user.theme,
        customCategories: user.customCategories,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.monthlyIncome = req.body.monthlyIncome !== undefined ? req.body.monthlyIncome : user.monthlyIncome;
      user.currency = req.body.currency || user.currency;
      user.language = req.body.language || user.language;
      user.theme = req.body.theme || user.theme;
      if (req.body.customCategories) {
        user.customCategories = req.body.customCategories;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        monthlyIncome: updatedUser.monthlyIncome,
        currency: updatedUser.currency,
        language: updatedUser.language,
        theme: updatedUser.theme,
        customCategories: updatedUser.customCategories,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (user && (await user.matchPassword(currentPassword))) {
      user.password = newPassword;
      await user.save();
      res.json({ message: 'Password updated successfully' });
    } else {
      res.status(401).json({ message: 'Invalid current password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete account
// @route   DELETE /api/auth/delete-account
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      await User.deleteOne({ _id: user._id });
      res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
      });
      res.json({ message: 'Account deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Auth with Google
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
  const { idToken } = req.body;

  try {
    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new Error('GOOGLE_CLIENT_ID is not defined in the server environment');
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, picture, sub: googleId } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (user) {
      // If user exists but is not Google user, update them
      if (!user.isGoogleUser) {
        user.isGoogleUser = true;
        user.googleId = googleId;
        user.avatar = picture;
        await user.save();
      }
    } else {
      // Create new Google user
      user = await User.create({
        name,
        email,
        googleId,
        isGoogleUser: true,
        avatar: picture,
      });
    }

    generateToken(res, user._id);
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      monthlyIncome: user.monthlyIncome,
      currency: user.currency,
      language: user.language,
      theme: user.theme,
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid Google Identity token', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteAccount,
  googleAuth,
};
