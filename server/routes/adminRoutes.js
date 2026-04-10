import express from 'express';
import { protect, admin, adminAndMod } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Kanji from '../models/Kanji.js';
import Feedback from '../models/Feedback.js';
import Announcement from '../models/Announcement.js';
import GameSetting from '../models/GameSetting.js';
import QuizHistory from '../models/QuizHistory.js';
import BattleRoom from '../models/BattleRoom.js';

const router = express.Router();

// ==========================================
// PVP SETTINGS & LEADERBOARD ADMIN
// ==========================================

router.get('/matches/live', protect, adminAndMod, async (req, res) => {
  try {
    const liveMatches = await BattleRoom.find({ status: { $in: ['waiting', 'playing'] } })
      .sort({ createdAt: -1 })
      .populate('hostUser', 'fullName')
      .populate('guestUser', 'fullName');
    res.json(liveMatches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ==========================================
// USER MANAGEMENT (Admin & Mod)
// ==========================================

// Get all users
router.get('/users', protect, adminAndMod, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle Ban Status
router.put('/users/:id/ban', protect, adminAndMod, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Prevent banning other admins
    if (user.role === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Moderators cannot ban admins' });
    }

    user.isBanned = req.body.isBanned;
    user.banReason = req.body.banReason || '';
    await user.save();
    
    res.json({ message: user.isBanned ? 'User banned' : 'User unbanned', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Change Role (Admin ONLY)
router.put('/users/:id/role', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.role = req.body.role;
    await user.save();
    
    res.json({ message: 'Role updated', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// ANALYTICS (Admin & Mod)
// ==========================================

router.get('/analytics', protect, adminAndMod, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalKanji = await Kanji.countDocuments();
    const totalMatches = await QuizHistory.countDocuments();
    
    // Aggregate users by registration date (last 7 days for chart)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const usersByDate = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      summary: { totalUsers, totalKanji, totalMatches },
      usersByDate
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// ANNOUNCEMENTS
// ==========================================

// Get all announcements
router.get('/announcements', async (req, res) => {
  try {
    const announcements = await Announcement.find({}).sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create announcement
router.post('/announcements', protect, adminAndMod, async (req, res) => {
  try {
    const newAnnouncement = new Announcement(req.body);
    const created = await newAnnouncement.save();
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle visibility or delete
router.delete('/announcements/:id', protect, adminAndMod, async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Announcement removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// FEEDBACKS
// ==========================================

router.get('/feedbacks', protect, adminAndMod, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({})
      .populate('user', 'fullName email')
      .populate('kanji', 'kanji meaning')
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/feedbacks/:id/status', protect, adminAndMod, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    
    feedback.status = req.body.status;
    feedback.adminNotes = req.body.adminNotes || feedback.adminNotes;
    await feedback.save();
    
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// PVP SETTINGS & LEADERBOARD ADMIN
// ==========================================

router.post('/reset-leaderboard', protect, admin, async (req, res) => {
  try {
    // We only reset QuizHistory and perhaps User current score if cached. 
    // Wait, the leaderboard aggregates from QuizHistory! 
    // If we delete or mark them as "archived", the leaderboard resets to 0.
    // Easiest is to delete all. Or we can just add a 'season' to QuizHistory. 
    // For simplicity: delete all histories or just delete PvP histories.
    await QuizHistory.deleteMany({ mode: { $in: ['battle', 'solo'] } });
    res.json({ message: 'Leaderboard has been completely reset to 0.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
