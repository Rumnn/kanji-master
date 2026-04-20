import express from 'express';
import ITVocabulary from '../models/ITVocabulary.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get random IT Vocabulary
// @route   GET /api/it-vocab/random?limit=10
// @access  Public
router.get('/random', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Retrieve random vocabulary
    const vocabs = await ITVocabulary.aggregate([
      { $sample: { size: limit } }
    ]);

    res.json(vocabs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Generate Quiz Questions
// @route   GET /api/it-vocab/quiz/generate?count=10
// @access  Public
router.get('/quiz/generate', async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 10;
    
    // Fetch all vocabularies
    const allVocabs = await ITVocabulary.find({});

    if (allVocabs.length < 4) {
      return res.status(400).json({ message: 'Không đủ từ vựng trong CSDL để tạo câu hỏi (cần ít nhất 4 từ).' });
    }

    // Shuffle all vocabs
    const shuffledVocabs = allVocabs.sort(() => 0.5 - Math.random());
    
    // We can only generate up to allVocabs.length unique questions
    const actualCount = Math.min(count, allVocabs.length);
    const questions = [];

    for (let i = 0; i < actualCount; i++) {
        const correctVocab = shuffledVocabs[i];
        
        // Pick 3 random wrong answers that are different from the correct one
        const wrongVocabs = shuffledVocabs
            .filter(v => v._id.toString() !== correctVocab._id.toString())
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
            
        const choices = [
            correctVocab.meaningVi,
            wrongVocabs[0].meaningVi,
            wrongVocabs[1].meaningVi,
            wrongVocabs[2].meaningVi,
        ].sort(() => 0.5 - Math.random()); // Shuffle choices
        
        questions.push({
            kanji: correctVocab.word,
            questionText: 'Chọn nghĩa tiếng Việt đúng cho từ này',
            correctAnswer: correctVocab.meaningVi,
            choices: choices
        });
    }

    res.json({ questions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all IT Vocabulary (Pagination could be added)
// @route   GET /api/it-vocab
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Limit to 1000 items to prevent server overload
    const vocabs = await ITVocabulary.find({}).limit(1000);
    res.json(vocabs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update IT Vocabulary Stats (called after quiz)
// @route   PUT /api/it-vocab/stats
// @access  Private (User)
router.put('/stats', protect, async (req, res) => {
  try {
    const { stats } = req.body; // array of { word: string, correct: boolean }
    if (!stats || !Array.isArray(stats)) {
      return res.status(400).json({ message: 'Invalid stats payload' });
    }
    
    const bulkOps = stats.map(s => ({
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

// @desc    Create multiple IT Vocabulary from Excel/CSV
// @route   POST /api/it-vocab/batch
// @access  Private/Admin
router.post('/batch', protect, admin, async (req, res) => {
  try {
    const vocabList = req.body.vocabs;

    if (!vocabList || !Array.isArray(vocabList)) {
      return res.status(400).json({ message: 'Invalid format. Expected array of vocabularies.' });
    }

    // Insert many, ignore duplicates (ordered: false)
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

// @desc    Create a new IT Vocabulary
// @route   POST /api/it-vocab
// @access  Private/Admin
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

// @desc    Delete an IT Vocabulary
// @route   DELETE /api/it-vocab/:id
// @access  Private/Admin
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
