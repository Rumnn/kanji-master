import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Kanji from './models/Kanji.js';
import User from './models/User.js';
import QuizHistory from './models/QuizHistory.js';
import fs from 'fs';

// Đọc file json chứa Database cũ
const kanjiData = JSON.parse(
  fs.readFileSync('../src/data/kanjiData.json', 'utf-8')
);

dotenv.config();

connectDB();

const importData = async () => {
  try {
    await Kanji.deleteMany(); // Reset kanji db
    // Keep users intact? Normally seeder clears all, but let's just clear Kanji for safety
    // or clear users and pre-seed an admin account
    await User.deleteMany();

    // 1. Tạo 1 Admin mẫu để tiện demo hệ thống
    const adminUser = {
      fullName: 'Adminstrator',
      email: 'admin@kanji.com',
      password: 'adminpassword',
      role: 'admin'
    };
    await User.create(adminUser);

    // 2. Chèn Kanji từ file JSON
    const mergedKanjis = [];
    
    // Gộp tất cả kanji ở các level thành môt mảng duy nhất và map lại thuộc tính
    Object.keys(kanjiData).forEach((levelKey) => {
      kanjiData[levelKey].forEach((k) => {
        mergedKanjis.push({
          kanji: k.kanji,
          level: levelKey, // N5, N4, N3
          onyomi: k.onyomi,
          kunyomi: k.kunyomi,
          meaning: k.meaning,
          meaningVi: k.meaningVi,
          examples: k.examples
        });
      });
    });

    await Kanji.insertMany(mergedKanjis);

    console.log('Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error with data import: ${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Kanji.deleteMany();
    await User.deleteMany();
    await QuizHistory.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error with data destroy: ${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
