import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const resetPassword = async () => {
  const email = process.argv[2]?.trim().toLowerCase();
  const password = process.argv[3];

  if (!email || !password) {
    console.error('Usage: node server/resetPassword.js <email> <new-password>');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('Password must be at least 6 characters.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kanji_master');

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.error(`No user found for ${email}`);
      process.exit(1);
    }

    user.password = password;
    await user.save();

    console.log(`Password reset successfully for ${email}`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

resetPassword();
