import crypto from 'crypto';
import express from 'express';
import User from '../models/User.js';
import rateLimit from '../middleware/rateLimit.js';
import { protect } from '../middleware/authMiddleware.js';
import { generateToken } from '../utils/jwt.js';

const router = express.Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const createOneTimeToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  return { rawToken, hashedToken: hashToken(rawToken) };
};

const getConfiguredAdminEmails = () => {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
};

const sanitizeUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  emailVerified: user.emailVerified,
  token: generateToken(user._id),
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', authLimiter, async (req, res) => {
  try {
    const fullName = req.body.fullName?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const { rawToken, hashedToken } = createOneTimeToken();
    const role = getConfiguredAdminEmails().includes(email) ? 'admin' : 'user';

    const user = await User.create({
      fullName,
      email,
      password,
      role,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    res.status(201).json({
      ...sanitizeUser(user),
      emailVerificationToken: process.env.NODE_ENV === 'production' ? undefined : rawToken,
      message: 'Account created. Verify email before publishing email-gated features.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', authLimiter, async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter both email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'No account found with this email. Please register first.' });
    }

    if (user.isBanned) {
      return res.status(403).json({
        message: 'This account has been locked.',
        reason: user.banReason
      });
    }

    if (!(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Incorrect password. Please try again.' });
    }

    res.json(sanitizeUser(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Change password for logged-in user
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', protect, authLimiter, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Request password reset token
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', authLimiter, async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return res.json({ message: 'If that email exists, a reset link will be sent.' });
    }

    const { rawToken, hashedToken } = createOneTimeToken();
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    res.json({
      message: 'If that email exists, a reset link will be sent.',
      resetToken: process.env.NODE_ENV === 'production' ? undefined : rawToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', authLimiter, async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Reset token and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({
      passwordResetToken: hashToken(token),
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return res.status(400).json({ message: 'Reset token is invalid or expired' });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Verify email with token
// @route   POST /api/auth/verify-email
// @access  Public
router.post('/verify-email', authLimiter, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const user = await User.findOne({
      emailVerificationToken: hashToken(token),
      emailVerificationExpires: { $gt: new Date() },
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      return res.status(400).json({ message: 'Verification token is invalid or expired' });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
