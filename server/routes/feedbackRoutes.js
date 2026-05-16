import express from 'express';
import Feedback from '../models/Feedback.js';
import Kanji from '../models/Kanji.js';
import { protect } from '../middleware/authMiddleware.js';
import rateLimit from '../middleware/rateLimit.js';

const router = express.Router();
const feedbackLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 15 });

// @desc    Submit feedback from a logged-in user
// @route   POST /api/feedback
// @access  Private
router.post('/', protect, feedbackLimiter, async (req, res) => {
  try {
    const { type, content, itemType = 'general', itemKey = '', kanjiId } = req.body;

    if (!type || !content?.trim()) {
      return res.status(400).json({ message: 'Feedback type and content are required' });
    }

    let kanji = kanjiId || undefined;
    if (!kanji && itemType === 'kanji' && itemKey) {
      const foundKanji = await Kanji.findOne({ kanji: itemKey }).select('_id');
      kanji = foundKanji?._id;
    }

    const feedback = await Feedback.create({
      user: req.user._id,
      kanji,
      itemType,
      itemKey: String(itemKey || ''),
      type,
      content: content.trim(),
    });

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get current user's feedback history
// @route   GET /api/feedback/my
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
