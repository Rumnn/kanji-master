import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import initSocket from './socket.js';

import authRoutes from './routes/authRoutes.js';
import kanjiRoutes from './routes/kanjiRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import battleRoutes from './routes/battleRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import itVocabRoutes from './routes/itVocabRoutes.js';

// Khởi tạo các biến môi trường
dotenv.config();

// Kết nối CSDL
connectDB().then(async () => {
  // Drop old unique index on roomCode if it exists (we removed unique constraint)
  try {
    const collection = mongoose.connection.collection('battlerooms');
    const indexes = await collection.indexes();
    const hasUniqueRoomCode = indexes.some(idx => idx.key?.roomCode && idx.unique);
    if (hasUniqueRoomCode) {
      await collection.dropIndex('roomCode_1');
      console.log('[DB] Dropped old unique index on roomCode');
    }
  } catch (e) {
    // Index might not exist, that's fine
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = initSocket(httpServer);

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/kanji', kanjiRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/battle', battleRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/it-vocab', itVocabRoutes);

// Serve frontend static files
const clientDistPath = join(__dirname, '..', 'dist');
if (process.env.NODE_ENV === 'production' || fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  // All non-API routes serve index.html (SPA fallback)
  app.use((req, res) => {
    if (req.path.startsWith('/api')) {
      res.status(404).json({ message: 'API route not found' });
    } else {
      res.sendFile(join(clientDistPath, 'index.html'));
    }
  });
} else {
  app.get('/', (req, res) => {
    res.send('Kanji Master API is running...');
  });
}

// Port
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
