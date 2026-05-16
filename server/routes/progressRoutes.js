import express from 'express';
import UserProgress from '../models/UserProgress.js';
import QuizHistory from '../models/QuizHistory.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

function getNextReviewDate(isCorrect, currentMastery) {
  const daysByMastery = [0, 1, 3, 7, 14, 30];
  const nextMastery = isCorrect
    ? Math.min(currentMastery + 1, 5)
    : Math.max(currentMastery - 1, 0);
  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + daysByMastery[nextMastery]);
  return { nextMastery, nextReviewAt };
}

function calculateDailyStreak(history) {
  const dayKeys = new Set(
    history.map((record) => record.createdAt.toISOString().slice(0, 10))
  );
  let cursor = new Date();
  let streak = 0;

  while (dayKeys.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

// @desc    Update per-user progress after a quiz
// @route   PUT /api/progress/batch
// @access  Private
router.put('/batch', protect, async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'Invalid progress payload' });
    }

    const cleanItems = items
      .filter((item) => item?.itemType && item?.itemKey && item?.label)
      .map((item) => ({
        itemType: item.itemType,
        itemKey: String(item.itemKey),
        label: item.label,
        level: item.level || '',
        category: item.category || '',
        correct: Boolean(item.correct)
      }));

    if (cleanItems.length === 0) {
      return res.status(400).json({ message: 'No valid progress items provided' });
    }

    const updated = [];

    for (const item of cleanItems) {
      const existing = await UserProgress.findOne({
        user: req.user._id,
        itemType: item.itemType,
        itemKey: item.itemKey
      });

      const currentMastery = existing?.mastery || 0;
      const { nextMastery, nextReviewAt } = getNextReviewDate(item.correct, currentMastery);

      const progress = await UserProgress.findOneAndUpdate(
        {
          user: req.user._id,
          itemType: item.itemType,
          itemKey: item.itemKey
        },
        {
          $set: {
            label: item.label,
            level: item.level,
            category: item.category,
            mastery: nextMastery,
            lastReviewedAt: new Date(),
            nextReviewAt
          },
          $inc: {
            attempts: 1,
            correct: item.correct ? 1 : 0,
            incorrect: item.correct ? 0 : 1
          }
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      updated.push(progress);
    }

    res.json({ message: 'Progress updated successfully', updatedCount: updated.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get user progress summary for profile dashboard
// @route   GET /api/progress/summary
// @access  Private
router.get('/summary', protect, async (req, res) => {
  try {
    const now = new Date();

    const [summary, byLevel, hardestItems, dueCount, recentHistory] = await Promise.all([
      UserProgress.aggregate([
        { $match: { user: req.user._id } },
        {
          $group: {
            _id: '$itemType',
            learnedItems: { $sum: 1 },
            attempts: { $sum: '$attempts' },
            correct: { $sum: '$correct' },
            incorrect: { $sum: '$incorrect' },
            averageMastery: { $avg: '$mastery' }
          }
        },
        {
          $project: {
            itemType: '$_id',
            _id: 0,
            learnedItems: 1,
            attempts: 1,
            correct: 1,
            incorrect: 1,
            averageMastery: { $round: ['$averageMastery', 1] },
            accuracy: {
              $round: [
                { $multiply: [{ $divide: ['$correct', { $max: ['$attempts', 1] }] }, 100] },
                1
              ]
            }
          }
        }
      ]),
      UserProgress.aggregate([
        { $match: { user: req.user._id, itemType: 'kanji', level: { $ne: '' } } },
        {
          $group: {
            _id: '$level',
            learnedItems: { $sum: 1 },
            attempts: { $sum: '$attempts' },
            correct: { $sum: '$correct' },
            incorrect: { $sum: '$incorrect' },
            averageMastery: { $avg: '$mastery' }
          }
        },
        {
          $project: {
            level: '$_id',
            _id: 0,
            learnedItems: 1,
            attempts: 1,
            correct: 1,
            incorrect: 1,
            averageMastery: { $round: ['$averageMastery', 1] },
            accuracy: {
              $round: [
                { $multiply: [{ $divide: ['$correct', { $max: ['$attempts', 1] }] }, 100] },
                1
              ]
            }
          }
        },
        { $sort: { level: 1 } }
      ]),
      UserProgress.find({ user: req.user._id, attempts: { $gt: 0 } })
        .sort({ mastery: 1, incorrect: -1, attempts: -1, lastReviewedAt: -1 })
        .limit(8)
        .select('itemType label level category attempts correct incorrect mastery nextReviewAt'),
      UserProgress.countDocuments({ user: req.user._id, nextReviewAt: { $lte: now } }),
      QuizHistory.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(60)
        .select('createdAt')
    ]);

    res.json({
      summary,
      byLevel,
      hardestItems,
      dueCount,
      streakDays: calculateDailyStreak(recentHistory)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get due review items
// @route   GET /api/progress/due?limit=20&type=kanji
// @access  Private
router.get('/due', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const query = {
      user: req.user._id,
      nextReviewAt: { $lte: new Date() }
    };

    if (req.query.type) {
      query.itemType = req.query.type;
    }

    const items = await UserProgress.find(query)
      .sort({ nextReviewAt: 1, mastery: 1 })
      .limit(limit);

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
