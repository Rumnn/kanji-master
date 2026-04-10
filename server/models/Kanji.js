import mongoose from 'mongoose';

const exampleSchema = new mongoose.Schema({
  kana: { type: String, required: true },
  romaji: { type: String },
  meaning: { type: String, required: true },
  meaningVi: { type: String, required: true },
}, { _id: false }); // Không tạo _id cho thẻ con này

const kanjiSchema = new mongoose.Schema({
  kanji: {
    type: String,
    required: [true, 'Please add the Kanji character'],
    unique: true,
  },
  level: {
    type: String,
    enum: ['N5', 'N4', 'N3', 'N2', 'N1'],
    required: [true, 'Please specify the JLPT level']
  },
  onyomi: {
    type: String,
    default: ''
  },
  kunyomi: {
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
  examples: [exampleSchema],
  stats: {
    timesAppeared: { type: Number, default: 0 },
    timesCorrect: { type: Number, default: 0 },
    timesIncorrect: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

const Kanji = mongoose.model('Kanji', kanjiSchema);
export default Kanji;
