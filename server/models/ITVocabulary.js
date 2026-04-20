import mongoose from 'mongoose';

const itVocabularySchema = new mongoose.Schema({
  word: {
    type: String,
    required: [true, 'Please add the vocabulary word'],
    unique: true,
  },
  romaji: {
    type: String,
    default: ''
  },
  meaning: {
    type: String,
    required: [true, 'Please add the English meaning']
  },
  meaningVi: {
    type: String,
    required: [true, 'Please add the Vietnamese meaning']
  },
  type: {
    type: String,
    default: 'General IT' // optionally categorise
  },
  stats: {
    timesAppeared: { type: Number, default: 0 },
    timesCorrect: { type: Number, default: 0 },
    timesIncorrect: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

const ITVocabulary = mongoose.model('ITVocabulary', itVocabularySchema);
export default ITVocabulary;
