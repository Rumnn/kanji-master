import { Server } from 'socket.io';
import BattleRoom from './models/BattleRoom.js';
import Kanji from './models/Kanji.js';
import { generateQuestions } from './routes/battleRoutes.js';

export default function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling'],
  });

  const roomPlayers = new Map();
  const playerFinished = new Map();

  io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    // Join room
    socket.on('room:join', async ({ roomCode, userId, userName }) => {
      try {
        if (!roomCode) {
          socket.emit('room:error', { message: 'Mã phòng không hợp lệ.' });
          return;
        }

        const code = roomCode.toUpperCase();
        console.log(`[Socket] room:join attempt - code: ${code}, user: ${userName} (${userId})`);

        let room = null;
        let attempts = 0;

        // Implement retry logic for MongoDB Atlas replication lag
        while (!room && attempts < 5) {
          let rooms = await BattleRoom.find({ roomCode: code, status: { $ne: 'finished' } }).sort({ createdAt: -1 }).limit(1);
          if (!rooms.length) rooms = await BattleRoom.find({ roomCode: code }).sort({ createdAt: -1 }).limit(1);
          room = rooms[0];
          
          if (!room) {
            attempts++;
            console.log(`[Socket] Room ${code} not found, waiting for DB sync... (attempt ${attempts})`);
            await new Promise(r => setTimeout(r, 600)); // wait 600ms before retrying
          }
        }

        if (!room) {
          console.log(`[Socket] ERROR: Room ${code} still not found in database after retries. Query returned empty.`);
          socket.emit('room:error', { message: 'Phòng không tồn tại.' });
          return;
        }

        if (room.status === 'finished') {
          socket.emit('room:error', { message: 'Trận đấu đã kết thúc.' });
          return;
        }

        const isHost = room.hostUser.toString() === userId;
        if (!isHost && room.status !== 'waiting') {
          socket.emit('room:error', { message: 'Trận đấu đã bắt đầu hoặc kết thúc.' });
          return;
        }

        if (!isHost) {
          if (room.guestUser && room.guestUser.toString() !== userId) {
            socket.emit('room:error', { message: 'Phòng đã đầy.' });
            return;
          }
          room.guestUser = userId;
          room.guestName = userName;
          await room.save();
        }

        socket.join(code);

        if (!roomPlayers.has(code)) roomPlayers.set(code, {});
        const players = roomPlayers.get(code);
        if (isHost) players.host = socket.id;
        else players.guest = socket.id;

        const currentSettings = {
          level: room.level,
          questionCount: room.questionCount,
          questionType: room.questionType,
          timePerQuestion: room.timePerQuestion
        };

        socket.emit('room:joined', {
          role: isHost ? 'host' : 'guest',
          roomCode: code,
          hostName: room.hostName,
          guestName: room.guestName || '',
          guestReady: room.guestReady,
          settings: currentSettings,
          status: room.status
        });

        if (!isHost) {
          io.to(code).emit('room:updated', {
            hostName: room.hostName,
            guestName: room.guestName || userName,
            guestReady: room.guestReady,
            settings: currentSettings,
            status: room.status
          });
        }
      } catch (err) {
        socket.emit('room:error', { message: 'Lỗi server: ' + err.message });
      }
    });

    // Update settings (Host only)
    socket.on('room:update_settings', async ({ roomCode, settings, role }) => {
      try {
        if (role !== 'host') return;
        const room = await BattleRoom.findOne({ roomCode, status: 'waiting' });
        if (!room) return;

        room.level = settings.level;
        room.questionCount = settings.questionCount;
        room.questionType = settings.questionType;
        room.timePerQuestion = settings.timePerQuestion;
        
        // Auto unready guest if settings change to be fair
        room.guestReady = false; 
        
        await room.save();

        io.to(roomCode).emit('room:settings_updated', {
          settings,
          guestReady: false
        });
      } catch (err) {
        console.error('[Socket] update_settings error', err);
      }
    });

    // Toggle Ready (Guest only)
    socket.on('room:toggle_ready', async ({ roomCode, role }) => {
      try {
        if (role !== 'guest') return;
        const room = await BattleRoom.findOne({ roomCode, status: 'waiting' });
        if (!room) return;

        room.guestReady = !room.guestReady;
        await room.save();

        io.to(roomCode).emit('room:guest_ready', {
          guestReady: room.guestReady
        });
      } catch (err) {
        console.error('[Socket] toggle_ready error', err);
      }
    });

    // Start game
    socket.on('game:start', async ({ roomCode, role }) => {
      try {
        if (role !== 'host') return;

        const room = await BattleRoom.findOne({ roomCode, status: 'waiting' });
        if (!room) {
          socket.emit('room:error', { message: 'Phòng không sẵn sàng.' });
          return;
        }

        if (!room.guestUser || !room.guestReady) {
          socket.emit('room:error', { message: 'Guest chưa sẵn sàng.' });
          return;
        }

        // Generate questions now based on final settings
        const kanjiPool = await Kanji.aggregate([
          { $match: { level: room.level } },
          { $sample: { size: Math.max(room.questionCount, 20) * 2 } }
        ]);

        if (kanjiPool.length < 4) {
          socket.emit('room:error', { message: 'Không đủ Kanji trong CSDL cho cấp độ này.' });
          return;
        }

        const questions = generateQuestions(kanjiPool, room.questionCount, room.questionType);
        room.questions = questions;
        room.status = 'playing';
        await room.save();

        playerFinished.set(roomCode, { host: false, guest: false });

        // Emit countdown
        io.to(roomCode).emit('game:countdown', { seconds: 3 });
        
        // Wait 3 seconds, then start
        setTimeout(() => {
          const safeQuestions = room.questions.map(q => ({
            kanji: q.kanji,
            questionText: q.questionText,
            type: q.type,
            choices: q.choices
          }));

          io.to(roomCode).emit('game:started', {
            questions: safeQuestions,
            timePerQuestion: room.timePerQuestion,
            questionCount: room.questionCount
          });
          console.log(`[Socket] Game started in room ${roomCode}`);
        }, 3000);

      } catch (err) {
        console.error('[Socket] game:start error:', err);
        socket.emit('room:error', { message: err.message });
      }
    });

    // Handle answer
    socket.on('game:answer', async ({ roomCode, questionIndex, answer, timeMs, role }) => {
      try {
        const room = await BattleRoom.findOne({ roomCode });
        if (!room || room.status !== 'playing') return;

        const question = room.questions[questionIndex];
        if (!question) return;

        const correct = answer === question.correctAnswer;
        const answerRecord = { questionIndex, answer, correct, timeMs };

        if (role === 'host') {
          room.hostAnswers.push(answerRecord);
          if (correct) room.hostScore += 1;
          room.hostTime += timeMs;
        } else {
          room.guestAnswers.push(answerRecord);
          if (correct) room.guestScore += 1;
          room.guestTime += timeMs;
        }

        await room.save();

        io.to(roomCode).emit('game:progress', {
          role,
          questionIndex,
          correct,
          hostScore: room.hostScore,
          guestScore: room.guestScore
        });
      } catch (err) {
        console.error('[Socket] game:answer error', err);
      }
    });

    // Handle finish
    socket.on('game:finished', async ({ roomCode, role }) => {
      try {
        const finished = playerFinished.get(roomCode) || { host: false, guest: false };
        finished[role] = true;
        playerFinished.set(roomCode, finished);

        io.to(roomCode).emit('game:playerFinished', { role });

        if (finished.host && finished.guest) {
          const room = await BattleRoom.findOne({ roomCode });
          if (!room) return;

          let winner = 'draw';
          if (room.hostScore > room.guestScore) winner = 'host';
          else if (room.guestScore > room.hostScore) winner = 'guest';
          else if (room.hostTime < room.guestTime) winner = 'host';
          else if (room.guestTime < room.hostTime) winner = 'guest';

          room.status = 'finished';
          room.winner = winner;
          await room.save();

          io.to(roomCode).emit('game:result', {
            winner, hostScore: room.hostScore, guestScore: room.guestScore,
            hostTime: room.hostTime, guestTime: room.guestTime,
            hostName: room.hostName, guestName: room.guestName,
            hostAnswers: room.hostAnswers, guestAnswers: room.guestAnswers,
            questions: room.questions
          });

          playerFinished.delete(roomCode);
          roomPlayers.delete(roomCode);
        }
      } catch (err) {
        console.error('[Socket] game:finished error', err);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${socket.id}`);
      for (const [roomCode, players] of roomPlayers.entries()) {
        let disconnectedRole = null;
        if (players.host === socket.id) disconnectedRole = 'host';
        else if (players.guest === socket.id) disconnectedRole = 'guest';

        if (disconnectedRole) {
          io.to(roomCode).emit('game:playerDisconnected', { role: disconnectedRole });
          
          setTimeout(async () => {
            try {
              const room = await BattleRoom.findOne({ roomCode });
              if (room && room.status === 'playing') {
                const winner = disconnectedRole === 'host' ? 'guest' : 'host';
                room.status = 'finished';
                room.winner = winner;
                await room.save();

                io.to(roomCode).emit('game:result', {
                  winner, hostScore: room.hostScore, guestScore: room.guestScore,
                  hostTime: room.hostTime, guestTime: room.guestTime,
                  hostName: room.hostName, guestName: room.guestName,
                  disconnected: disconnectedRole, hostAnswers: room.hostAnswers,
                  guestAnswers: room.guestAnswers, questions: room.questions
                });
                playerFinished.delete(roomCode);
                roomPlayers.delete(roomCode);
              }
            } catch (err) {
              console.error('[Socket] disconnect cleanup error', err);
            }
          }, 30000);
          break;
        }
      }
    });
  });

  return io;
}

