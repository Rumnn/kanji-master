import mongoose from 'mongoose';

const quizHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quizName: {
    type: String,
    required: [true, 'Pleas provide a quiz name (e.g., "N4 - Random 10")']
  },
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

const QuizHistory = mongoose.model('QuizHistory', quizHistorySchema);
export default QuizHistory;
