import express from 'express';
import ITVocabulary from '../models/ITVocabulary.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/random', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const vocabs = await ITVocabulary.aggregate([
      { $sample: { size: limit } }
    ]);

    res.json(vocabs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/quiz/generate', async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 10;
    const type = req.query.type;
    const query = type ? { type } : {};

    const allVocabs = await ITVocabulary.find(query);

    if (allVocabs.length < 4) {
      return res.status(400).json({ message: 'Not enough vocabulary in database to generate questions. At least 4 words are required.' });
    }

    const shuffledVocabs = allVocabs.sort(() => 0.5 - Math.random());
    const actualCount = Math.min(count, allVocabs.length);
    const questions = [];

    for (let i = 0; i < actualCount; i++) {
      const correctVocab = shuffledVocabs[i];
      const wrongVocabs = shuffledVocabs
        .filter((v) => v._id.toString() !== correctVocab._id.toString())
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      const choices = [
        correctVocab.meaningVi,
        wrongVocabs[0].meaningVi,
        wrongVocabs[1].meaningVi,
        wrongVocabs[2].meaningVi,
      ].sort(() => 0.5 - Math.random());

      questions.push({
        kanji: correctVocab.word,
        questionText: 'Choose the correct Vietnamese meaning for this word',
        correctAnswer: correctVocab.meaningVi,
        choices,
        type: correctVocab.type
      });
    }

    res.json({ questions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { search, type } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 1000, 1), 1000);
    const usePaginationEnvelope = Boolean(req.query.page || req.query.limit || search || type);
    const query = {};

    if (type) {
      query.type = type;
    }

    if (search) {
      const pattern = new RegExp(String(search).trim(), 'i');
      query.$or = [
        { word: pattern },
        { romaji: pattern },
        { meaning: pattern },
        { meaningVi: pattern },
        { type: pattern }
      ];
    }

    const [vocabs, total] = await Promise.all([
      ITVocabulary.find(query)
        .sort({ type: 1, word: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      ITVocabulary.countDocuments(query)
    ]);

    if (usePaginationEnvelope) {
      return res.json({
        items: vocabs,
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      });
    }

    res.json(vocabs);
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
      .filter((s) => s?.word)
      .map((s) => ({
        updateOne: {
          filter: { word: s.word },
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
      await ITVocabulary.bulkWrite(bulkOps);
    }

    res.json({ message: 'Stats updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/batch', protect, admin, async (req, res) => {
  try {
    const vocabList = req.body.vocabs;

    if (!vocabList || !Array.isArray(vocabList)) {
      return res.status(400).json({ message: 'Invalid format. Expected array of vocabularies.' });
    }

    const result = await ITVocabulary.insertMany(vocabList, { ordered: false });

    res.status(201).json({ message: `Successfully imported ${result.length} IT vocabulary words!` });
  } catch (error) {
    if (error.code === 11000) {
      const insertedCount = error.insertedDocs ? error.insertedDocs.length : 0;
      return res.status(201).json({ message: `Import complete. Added ${insertedCount} new words. Existing ones were skipped.` });
    }
    res.status(400).json({ message: error.message });
  }
});

router.post('/', protect, admin, async (req, res) => {
  try {
    const { word, romaji, meaning, meaningVi, type } = req.body;

    const vocabExists = await ITVocabulary.findOne({ word });

    if (vocabExists) {
      return res.status(400).json({ message: 'Vocabulary already exists in DB' });
    }

    const newVocab = await ITVocabulary.create({
      word,
      romaji,
      meaning,
      meaningVi,
      type
    });

    res.status(201).json(newVocab);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', protect, admin, async (req, res) => {
  try {
    const allowedFields = ['word', 'romaji', 'meaning', 'meaningVi', 'type'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided' });
    }

    const updatedVocab = await ITVocabulary.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!updatedVocab) {
      return res.status(404).json({ message: 'Vocabulary not found' });
    }

    res.json(updatedVocab);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Vocabulary already exists in DB' });
    }
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const vocab = await ITVocabulary.findById(req.params.id);

    if (vocab) {
      await ITVocabulary.deleteOne({ _id: vocab._id });
      res.json({ message: 'Vocabulary removed' });
    } else {
      res.status(404).json({ message: 'Vocabulary not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
