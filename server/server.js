import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import kanjiRoutes from './routes/kanjiRoutes.js';
import historyRoutes from './routes/historyRoutes.js';

// Khởi tạo các biến môi trường
dotenv.config();

// Kết nối CSDL
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes cơ bản
app.use('/api/auth', authRoutes);
app.use('/api/kanji', kanjiRoutes);
app.use('/api/history', historyRoutes);

app.get('/', (req, res) => {
  res.send('Kanji Master API is running...');
});

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
