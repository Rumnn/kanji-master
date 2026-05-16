import express from 'express';
import Kanji from '../models/Kanji.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

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
    }

    return res.json({ message: `Database already has ${count} kanjis. No action taken.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/random', async (req, res) => {
  try {
    const level = req.query.level || 'N5';
    const limit = parseInt(req.query.limit) || 10;

    const kanjis = await Kanji.aggregate([
      { $match: { level } },
      { $sample: { size: limit } }
    ]);

    res.json(kanjis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { level, search } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 500, 1), 500);
    const usePaginationEnvelope = Boolean(req.query.page || req.query.limit || search);
    const query = {};

    if (level) {
      query.level = level;
    }

    if (search) {
      const pattern = new RegExp(String(search).trim(), 'i');
      query.$or = [
        { kanji: pattern },
        { onyomi: pattern },
        { kunyomi: pattern },
        { meaning: pattern },
        { meaningVi: pattern }
      ];
    }

    const [kanjis, total] = await Promise.all([
      Kanji.find(query)
        .sort({ level: 1, kanji: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Kanji.countDocuments(query)
    ]);

    if (usePaginationEnvelope) {
      return res.json({
        items: kanjis,
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      });
    }

    res.json(kanjis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/stats', protect, async (req, res) => {
  try {
    const { stats } = req.body;
    if (!stats || !Array.isArray(stats)) {
      return res.status(400).json({ message: 'Invalid stats payload' });
    }

    const bulkOps = stats
      .filter((s) => s?.kanji)
      .map((s) => ({
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

router.post('/batch', protect, admin, async (req, res) => {
  try {
    const kanjiList = req.body.kanjis;

    if (!kanjiList || !Array.isArray(kanjiList)) {
      return res.status(400).json({ message: 'Invalid format. Expected array of kanjis.' });
    }

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

router.put('/:id', protect, admin, async (req, res) => {
  try {
    const allowedFields = ['kanji', 'level', 'onyomi', 'kunyomi', 'meaning', 'meaningVi', 'examples'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided' });
    }

    const updatedKanji = await Kanji.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!updatedKanji) {
      return res.status(404).json({ message: 'Kanji not found' });
    }

    res.json(updatedKanji);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Kanji already exists in DB' });
    }
    res.status(400).json({ message: error.message });
  }
});

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
