import express from 'express';
import QuizHistory from '../models/QuizHistory.js';
import BattleRoom from '../models/BattleRoom.js';
import User from '../models/User.js';

const router = express.Router();

// @desc    Get overall leaderboard (top quiz scores)
// @route   GET /api/leaderboard?limit=20
// @access  Public
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    // Aggregate quiz history: sum total correct answers and total questions for each user
    const leaderboard = await QuizHistory.aggregate([
      {
        $group: {
          _id: '$user',
          totalScore: { $sum: '$score' },
          totalQuestions: { $sum: '$totalQuestions' },
          quizCount: { $sum: 1 },
          bestScore: { $max: { $multiply: [{ $divide: ['$score', '$totalQuestions'] }, 100] } },
        }
      },
      { $sort: { totalScore: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          _id: 1,
          fullName: '$userInfo.fullName',
          totalScore: 1,
          totalQuestions: 1,
          quizCount: 1,
          bestScore: { $round: ['$bestScore', 1] },
          accuracy: {
            $round: [
              { $multiply: [{ $divide: ['$totalScore', { $max: ['$totalQuestions', 1] }] }, 100] },
              1
            ]
          }
        }
      }
    ]);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get battle leaderboard (wins)
// @route   GET /api/leaderboard/battles?limit=20
// @access  Public
router.get('/battles', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    // Count wins for each user from finished battle rooms
    const hostWins = await BattleRoom.aggregate([
      { $match: { status: 'finished', winner: 'host' } },
      { $group: { _id: '$hostUser', wins: { $sum: 1 } } }
    ]);

    const guestWins = await BattleRoom.aggregate([
      { $match: { status: 'finished', winner: 'guest' } },
      { $group: { _id: '$guestUser', wins: { $sum: 1 } } }
    ]);

    // Count total battles
    const hostBattles = await BattleRoom.aggregate([
      { $match: { status: 'finished' } },
      { $group: { _id: '$hostUser', total: { $sum: 1 } } }
    ]);

    const guestBattles = await BattleRoom.aggregate([
      { $match: { status: 'finished', guestUser: { $ne: null } } },
      { $group: { _id: '$guestUser', total: { $sum: 1 } } }
    ]);

    // Merge stats
    const statsMap = new Map();

    for (const h of hostWins) {
      const key = h._id.toString();
      if (!statsMap.has(key)) statsMap.set(key, { wins: 0, total: 0 });
      statsMap.get(key).wins += h.wins;
    }
    for (const g of guestWins) {
      const key = g._id.toString();
      if (!statsMap.has(key)) statsMap.set(key, { wins: 0, total: 0 });
      statsMap.get(key).wins += g.wins;
    }
    for (const h of hostBattles) {
      const key = h._id.toString();
      if (!statsMap.has(key)) statsMap.set(key, { wins: 0, total: 0 });
      statsMap.get(key).total += h.total;
    }
    for (const g of guestBattles) {
      const key = g._id.toString();
      if (!statsMap.has(key)) statsMap.set(key, { wins: 0, total: 0 });
      statsMap.get(key).total += g.total;
    }

    // Convert to array, lookup user names
    const userIds = [...statsMap.keys()];
    const users = await User.find({ _id: { $in: userIds } }).select('fullName');
    const userMap = new Map(users.map(u => [u._id.toString(), u.fullName]));

    const battleLeaderboard = userIds
      .map(id => ({
        _id: id,
        fullName: userMap.get(id) || 'Unknown',
        wins: statsMap.get(id).wins,
        totalBattles: statsMap.get(id).total,
        winRate: statsMap.get(id).total > 0
          ? Math.round((statsMap.get(id).wins / statsMap.get(id).total) * 100)
          : 0
      }))
      .sort((a, b) => b.wins - a.wins)
      .slice(0, limit);

    res.json(battleLeaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
