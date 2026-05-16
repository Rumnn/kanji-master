import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  kanji: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Kanji'
  },
  itemType: {
    type: String,
    enum: ['kanji', 'it_vocab', 'quiz_question', 'general'],
    default: 'general'
  },
  itemKey: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['kanji_error', 'answer_error', 'meaning_suggestion', 'example_suggestion', 'general_bug', 'feature_request'],
    required: true
  },
  content: {
    type: String,
    required: [true, 'Please provide feedback content']
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
