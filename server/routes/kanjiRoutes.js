import express from 'express';
import Kanji from '../models/Kanji.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// @desc    Seed database with base Kanji data manually from URL
// @route   GET /api/kanji/seed-database
// @access  Public (Temporary)
router.get('/seed-database', async (req, res) => {
  try {
    const dataPath = join(__dirname, '../../src/data/kanjiData.json');
    const kanjiData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    const mergedKanjis = [];
    Object.keys(kanjiData).forEach((levelKey) => {
      kanjiData[levelKey].forEach((k) => {
        mergedKanjis.push({
          kanji: k.kanji,
          level: levelKey,
          onyomi: k.onyomi,
          kunyomi: k.kunyomi,
          meaning: k.meaning,
          meaningVi: k.meaningVi,
          examples: k.examples
        });
      });
    });

    const count = await Kanji.countDocuments();
    if (count === 0) {
      await Kanji.insertMany(mergedKanjis);
      return res.json({ message: `Success! Seeded ${mergedKanjis.length} kanjis into the database.` });
    } else {
      return res.json({ message: `Database already has ${count} kanjis. No action taken.` });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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

// @desc    Update Kanji Stats (called after quiz/battle)
// @route   PUT /api/kanji/stats
// @access  Private (User)
router.put('/stats', protect, async (req, res) => {
  try {
    const { stats } = req.body; // array of { kanji: string, correct: boolean }
    if (!stats || !Array.isArray(stats)) {
      return res.status(400).json({ message: 'Invalid stats payload' });
    }
    
    const bulkOps = stats.map(s => ({
      updateOne: {
        filter: { kanji: s.kanji },
        update: {
          $inc: { 
            'stats.timesAppeared': 1,
            'stats.timesCorrect': s.correct ? 1 : 0,
            'stats.timesIncorrect': s.correct ? 0 : 1
          }
        }
      }
    }));

    if (bulkOps.length > 0) {
      await Kanji.bulkWrite(bulkOps);
    }
    
    res.json({ message: 'Stats updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create multiple Kanji from Excel/CSV
// @route   POST /api/kanji/batch
// @access  Private/Admin
router.post('/batch', protect, admin, async (req, res) => {
  try {
    const kanjiList = req.body.kanjis;

    if (!kanjiList || !Array.isArray(kanjiList)) {
      return res.status(400).json({ message: 'Invalid format. Expected array of kanjis.' });
    }

    // Insert many, ignore duplicates (ordered: false)
    const result = await Kanji.insertMany(kanjiList, { ordered: false });
    
    res.status(201).json({ message: `Successfully imported ${result.length} Kanji characters!` });
  } catch (error) {
    if (error.code === 11000) {
       const insertedCount = error.insertedDocs ? error.insertedDocs.length : 0;
       return res.status(201).json({ message: `Import complete. Added ${insertedCount} new characters. Existing ones were skipped.` });
    }
    res.status(400).json({ message: error.message });
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
