import mongoose from 'mongoose';

const battleRoomSchema = new mongoose.Schema({
  roomCode: {
    type: String,
    required: true,
    uppercase: true,
    maxlength: 6
  },
  hostUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hostName: {
    type: String,
    required: true
  },
  guestUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  guestName: {
    type: String,
    default: null
  },
  guestReady: {
    type: Boolean,
    default: false
  },
  level: {
    type: String,
    enum: ['N5', 'N4', 'N3', 'N2', 'N1'],
    default: 'N5'
  },
  questionCount: {
    type: Number,
    default: 10
  },
  questionType: {
    type: String,
    enum: ['reading', 'meaning', 'kanji', 'mixed'],
    default: 'mixed'
  },
  timePerQuestion: {
    type: Number,
    default: 10
  },
  status: {
    type: String,
    enum: ['waiting', 'playing', 'finished'],
    default: 'waiting'
  },
  questions: [{
    kanjiId: { type: mongoose.Schema.Types.ObjectId, ref: 'Kanji' },
    kanji: String,
    questionText: String,
    type: { type: String }, // fixes mongoose reserved keyword issue
    correctAnswer: String,
    choices: [String]
  }],
  hostScore: { type: Number, default: 0 },
  guestScore: { type: Number, default: 0 },
  hostTime: { type: Number, default: 0 },  // total ms
  guestTime: { type: Number, default: 0 },
  hostAnswers: [{ questionIndex: Number, answer: String, correct: Boolean, timeMs: Number }],
  guestAnswers: [{ questionIndex: Number, answer: String, correct: Boolean, timeMs: Number }],
  winner: {
    type: String,
    enum: ['host', 'guest', 'draw', null],
    default: null
  }
}, {
  timestamps: true
});

// Auto-delete rooms older than 24 hours
battleRoomSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const BattleRoom = mongoose.model('BattleRoom', battleRoomSchema);
export default BattleRoom;
