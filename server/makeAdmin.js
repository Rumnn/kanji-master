import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const email = 'admin@kanji.com';
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        fullName: 'Administrator',
        email,
        password: 'adminpassword',
        role: 'admin',
      });
      await user.save();
      console.log('Created new admin account:', email);
    } else {
      user.role = 'admin';
      user.password = 'adminpassword'; // UserSchema pre('save') hash hook will handle this
      await user.save();
      console.log('Updated existing account to admin and reset password:', email);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

makeAdmin();
