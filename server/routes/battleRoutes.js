import express from 'express';
import BattleRoom from '../models/BattleRoom.js';
import Kanji from '../models/Kanji.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper: generate 6-char room code
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Helper: generate MCQ questions from kanji list
function generateQuestions(kanjiPool, count, questionType) {
  const questions = [];
  const shuffled = kanjiPool.sort(() => Math.random() - 0.5).slice(0, count);

  for (const k of shuffled) {
    // Determine which type of question for this kanji
    let type = questionType;
    if (type === 'mixed') {
      const types = ['reading', 'meaning', 'kanji'];
      type = types[Math.floor(Math.random() * types.length)];
    }

    let questionText, correctAnswer;
    let choicePool = [];

    if (type === 'reading') {
      // Show kanji + meaning → pick correct reading
      questionText = `「${k.kanji}」の読み方は？ (${k.meaningVi})`;
      const readings = [];
      if (k.kunyomi) readings.push(k.kunyomi.replace(/\./g, ''));
      if (k.onyomi) readings.push(k.onyomi);
      correctAnswer = readings[0] || k.onyomi || k.kunyomi || '—';
      // Get wrong readings from other kanji
      choicePool = kanjiPool
        .filter(x => x._id.toString() !== k._id.toString())
        .map(x => {
          const r = [];
          if (x.kunyomi) r.push(x.kunyomi.replace(/\./g, ''));
          if (x.onyomi) r.push(x.onyomi);
          return r[0] || x.onyomi || x.kunyomi || null;
        })
        .filter(x => x && x !== correctAnswer);

    } else if (type === 'meaning') {
      // Show kanji → pick correct Vietnamese meaning
      questionText = `「${k.kanji}」có nghĩa là gì?`;
      correctAnswer = k.meaningVi;
      choicePool = kanjiPool
        .filter(x => x._id.toString() !== k._id.toString())
        .map(x => x.meaningVi)
        .filter(x => x !== correctAnswer);

    } else {
      // type === 'kanji': Show meaning → pick correct kanji
      questionText = `Kanji nào có nghĩa "${k.meaningVi}"?`;
      correctAnswer = k.kanji;
      choicePool = kanjiPool
        .filter(x => x._id.toString() !== k._id.toString())
        .map(x => x.kanji)
        .filter(x => x !== correctAnswer);
    }

    // Pick 3 unique wrong answers
    const uniquePool = [...new Set(choicePool)];
    const wrongAnswers = uniquePool.sort(() => Math.random() - 0.5).slice(0, 3);

    // If not enough wrong answers, pad with placeholders
    while (wrongAnswers.length < 3) {
      wrongAnswers.push('—');
    }

    // Combine and shuffle choices
    const choices = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);

    questions.push({
      kanjiId: k._id,
      kanji: k.kanji,
      questionText,
      type,
      correctAnswer,
      choices
    });
  }

  return questions;
}

// @desc    Create a battle room
// @route   POST /api/battle/create
// @access  Private
router.post('/create', protect, async (req, res) => {
  try {
    const { level, questionCount, questionType, timePerQuestion } = req.body;

    // Get kanji pool for generating questions
    const kanjiPool = await Kanji.aggregate([
      { $match: { level: level || 'N5' } },
      { $sample: { size: Math.max(parseInt(questionCount) || 10, 20) * 2 } }
    ]);

    if (kanjiPool.length < 4) {
      return res.status(400).json({ message: 'Not enough Kanji in database for this level.' });
    }

    const questions = generateQuestions(kanjiPool, parseInt(questionCount) || 10, questionType || 'mixed');

    // Generate unique room code
    let roomCode;
    let exists = true;
    while (exists) {
      roomCode = generateRoomCode();
      exists = await BattleRoom.findOne({ roomCode, status: { $ne: 'finished' } });
    }

    const room = await BattleRoom.create({
      roomCode,
      hostUser: req.user._id,
      hostName: req.user.fullName,
      level: level || 'N5',
      questionCount: questions.length,
      questionType: questionType || 'mixed',
      timePerQuestion: timePerQuestion || 10,
      questions,
      status: 'waiting'
    });

    res.status(201).json({
      roomCode: room.roomCode,
      _id: room._id,
      level: room.level,
      questionCount: room.questionCount,
      questionType: room.questionType,
      timePerQuestion: room.timePerQuestion,
      hostName: room.hostName,
      status: room.status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get room info
// @route   GET /api/battle/:roomCode
// @access  Private
router.get('/:roomCode', protect, async (req, res) => {
  try {
    const room = await BattleRoom.findOne({ roomCode: req.params.roomCode.toUpperCase() });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Don't send correct answers to client during game
    const safeQuestions = room.questions.map(q => ({
      kanji: q.kanji,
      questionText: q.questionText,
      type: q.type,
      choices: q.choices,
      // Only include correctAnswer if game is finished
      ...(room.status === 'finished' ? { correctAnswer: q.correctAnswer } : {})
    }));

    res.json({
      _id: room._id,
      roomCode: room.roomCode,
      hostName: room.hostName,
      guestName: room.guestName,
      level: room.level,
      questionCount: room.questionCount,
      questionType: room.questionType,
      timePerQuestion: room.timePerQuestion,
      status: room.status,
      questions: safeQuestions,
      hostScore: room.hostScore,
      guestScore: room.guestScore,
      hostTime: room.hostTime,
      guestTime: room.guestTime,
      winner: room.winner,
      hostAnswers: room.status === 'finished' ? room.hostAnswers : [],
      guestAnswers: room.status === 'finished' ? room.guestAnswers : [],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Generate MCQ questions (solo, no battle)
// @route   GET /api/battle/quiz/generate?level=N5&count=10&type=mixed
// @access  Private
router.get('/quiz/generate', protect, async (req, res) => {
  try {
    const level = req.query.level || 'N5';
    const count = parseInt(req.query.count) || 10;
    const type = req.query.type || 'mixed';

    const kanjiPool = await Kanji.aggregate([
      { $match: { level } },
      { $sample: { size: Math.max(count, 20) * 2 } }
    ]);

    if (kanjiPool.length < 4) {
      return res.status(400).json({ message: 'Not enough Kanji in database for this level.' });
    }

    const questions = generateQuestions(kanjiPool, count, type);

    res.json({ questions, level, type });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
export { generateQuestions };
