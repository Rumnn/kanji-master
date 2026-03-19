import express from 'express';
import QuizHistory from '../models/QuizHistory.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Create new quiz history record
// @route   POST /api/history
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { quizName, score, totalQuestions } = req.body;

    const history = new QuizHistory({
      user: req.user._id,
      quizName,
      score,
      totalQuestions,
    });

    const savedHistory = await history.save();
    res.status(201).json(savedHistory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get logged in user history
// @route   GET /api/history
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const history = await QuizHistory.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
