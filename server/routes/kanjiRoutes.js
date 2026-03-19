import express from 'express';
import Kanji from '../models/Kanji.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get random Kanji by level
// @route   GET /api/kanji/random?level=N5&limit=10
// @access  Public (or Protected depending on requirements)
router.get('/random', async (req, res) => {
  try {
    const level = req.query.level || 'N5';
    const limit = parseInt(req.query.limit) || 10;

    // Lấy random bằng aggregate rỗng của MongoDB
    const kanjis = await Kanji.aggregate([
      { $match: { level: level } },
      { $sample: { size: limit } }
    ]);

    res.json(kanjis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all Kanji (Pagination could be added)
// @route   GET /api/kanji
// @access  Public
router.get('/', async (req, res) => {
  try {
    const level = req.query.level;
    const query = level ? { level } : {};
    
    // Giới hạn 500 từ mặc định để không tạch server
    const kanjis = await Kanji.find(query).limit(500);
    res.json(kanjis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a new Kanji
// @route   POST /api/kanji
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { kanji, level, onyomi, kunyomi, meaning, meaningVi, examples } = req.body;

    const kanjiExists = await Kanji.findOne({ kanji });

    if (kanjiExists) {
      return res.status(400).json({ message: 'Kanji already exists in DB' });
    }

    const newKanji = await Kanji.create({
      kanji,
      level,
      onyomi,
      kunyomi,
      meaning,
      meaningVi,
      examples
    });

    res.status(201).json(newKanji);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete a Kanji
// @route   DELETE /api/kanji/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const kanji = await Kanji.findById(req.params.id);

    if (kanji) {
      await Kanji.deleteOne({ _id: kanji._id });
      res.json({ message: 'Kanji removed' });
    } else {
      res.status(404).json({ message: 'Kanji not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
