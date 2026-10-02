const bcrypt = require('bcryptjs');
const { User } = require('../models/User');
const { generateToken } = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields: name, email, and password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // Hash password with bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in MongoDB
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'user',
    });

    if (user) {
      const token = generateToken(user._id, user.role);

      return res.status(201).json({
        message: 'Account registered successfully',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data provided.' });
    }
  } catch (error) {
    console.error('Error in registerUser controller:', error);
    return res.status(500).json({
      message: error.message || 'Server error during registration.',
      error: error.message,
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter both email and password.' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    return res.json({
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Error in loginUser controller:', error);
    return res.status(500).json({
      message: error.message || 'Server error during login.',
      error: error.message,
    });
  }
};

// @desc    Get currently logged in user profile
// @route   GET /api/me
// @access  Private (Protected)
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Error in getMe controller:', error);
    res.status(500).json({
      message: error.message || 'Server error fetching user profile.',
      error: error.message,
    });
  }
};

module.exports = { registerUser, loginUser, getMe };
