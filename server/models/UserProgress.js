import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  itemType: {
    type: String,
    enum: ['kanji', 'it_vocab', 'grammar', 'jlpt_vocab'],
    required: true,
    index: true
  },
  itemKey: {
    type: String,
    required: true,
    index: true
  },
  label: {
    type: String,
    required: true
  },
  level: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: ''
  },
  attempts: {
    type: Number,
    default: 0
  },
  correct: {
    type: Number,
    default: 0
  },
  incorrect: {
    type: Number,
    default: 0
  },
  mastery: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  lastReviewedAt: {
    type: Date,
    default: null
  },
  nextReviewAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

userProgressSchema.index({ user: 1, itemType: 1, itemKey: 1 }, { unique: true });

const UserProgress = mongoose.model('UserProgress', userProgressSchema);
export default UserProgress;
