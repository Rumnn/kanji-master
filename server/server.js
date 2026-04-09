import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import initSocket from './socket.js';

import authRoutes from './routes/authRoutes.js';
import kanjiRoutes from './routes/kanjiRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import battleRoutes from './routes/battleRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';

// Khởi tạo các biến môi trường
dotenv.config();

// Kết nối CSDL
connectDB();

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = initSocket(httpServer);

// Middleware
app.use(cors());
app.use(express.json());

// Routes cơ bản
app.use('/api/auth', authRoutes);
app.use('/api/kanji', kanjiRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/battle', battleRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

app.get('/', (req, res) => {
  res.send('Kanji Master API is running...');
});

// Port
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
