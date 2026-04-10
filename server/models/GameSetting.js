import mongoose from 'mongoose';

const gameSettingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String
  }
}, {
  timestamps: true
});

const GameSetting = mongoose.model('GameSetting', gameSettingSchema);
export default GameSetting;
