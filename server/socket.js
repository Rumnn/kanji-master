import { Server } from 'socket.io';
import BattleRoom from './models/BattleRoom.js';

export default function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    },
    // Ensure WebSocket works on Render
    transports: ['websocket', 'polling'],
  });

  // Track connected players by room
  const roomPlayers = new Map(); // roomCode -> { host: socketId, guest: socketId }
  const playerFinished = new Map(); // roomCode -> { host: bool, guest: bool }

  io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    // Join a battle room
    socket.on('room:join', async ({ roomCode, userId, userName }) => {
      try {
        if (!roomCode) {
          socket.emit('room:error', { message: 'Mã phòng không hợp lệ.' });
          return;
        }

        const code = roomCode.toUpperCase();
        console.log(`[Socket] room:join attempt - code: ${code}, user: ${userName} (${userId})`);

        // Find the most recent non-finished room with this code, or any room with this code
        let room = await BattleRoom.findOne({ roomCode: code, status: { $ne: 'finished' } }).sort({ createdAt: -1 });
        
        if (!room) {
          // Fallback: try finding any room with this code (it might have just been created)
          room = await BattleRoom.findOne({ roomCode: code }).sort({ createdAt: -1 });
        }

        if (!room) {
          console.log(`[Socket] Room ${code} not found in database`);
          socket.emit('room:error', { message: 'Phòng không tồn tại.' });
          return;
        }

        if (room.status === 'finished') {
          socket.emit('room:error', { message: 'Trận đấu đã kết thúc.' });
          return;
        }

        const isHost = room.hostUser.toString() === userId;
        console.log(`[Socket] Room ${code} found. Status: ${room.status}, isHost: ${isHost}`);

        if (!isHost && room.status !== 'waiting') {
          socket.emit('room:error', { message: 'Trận đấu đã bắt đầu hoặc kết thúc.' });
          return;
        }

        // If guest joining
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

        // Track players
        if (!roomPlayers.has(code)) {
          roomPlayers.set(code, {});
        }
        const players = roomPlayers.get(code);
        if (isHost) {
          players.host = socket.id;
        } else {
          players.guest = socket.id;
        }

        socket.emit('room:joined', {
          role: isHost ? 'host' : 'guest',
          roomCode: code,
          hostName: room.hostName,
          guestName: room.guestName || '',
          status: room.status
        });

        // Notify room that guest joined
        if (!isHost) {
          io.to(code).emit('room:updated', {
            hostName: room.hostName,
            guestName: room.guestName || userName,
            status: room.status
          });
        }

        console.log(`[Socket] ${userName} joined room ${code} as ${isHost ? 'host' : 'guest'}`);
      } catch (err) {
        console.error('[Socket] room:join error:', err);
        socket.emit('room:error', { message: 'Lỗi server: ' + err.message });
      }
    });

    // Host starts the game
    socket.on('game:start', async ({ roomCode }) => {
      try {
        const room = await BattleRoom.findOne({ roomCode, status: 'waiting' });
        if (!room) {
          socket.emit('room:error', { message: 'Phòng không sẵn sàng.' });
          return;
        }

        if (!room.guestUser) {
          socket.emit('room:error', { message: 'Chờ đối thủ tham gia trước.' });
          return;
        }

        room.status = 'playing';
        await room.save();

        // Initialize finish tracking
        playerFinished.set(roomCode, { host: false, guest: false });

        // Send questions to both players (without correct answers)
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
      } catch (err) {
        console.error('[Socket] game:start error:', err);
        socket.emit('room:error', { message: err.message });
      }
    });

    // Player submits answer for a question
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

        // Notify opponent of progress
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

    // Player finishes all questions
    socket.on('game:finished', async ({ roomCode, role }) => {
      try {
        const finished = playerFinished.get(roomCode) || { host: false, guest: false };
        finished[role] = true;
        playerFinished.set(roomCode, finished);

        io.to(roomCode).emit('game:playerFinished', { role });

        // If both finished, determine winner
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
            winner,
            hostScore: room.hostScore,
            guestScore: room.guestScore,
            hostTime: room.hostTime,
            guestTime: room.guestTime,
            hostName: room.hostName,
            guestName: room.guestName,
            hostAnswers: room.hostAnswers,
            guestAnswers: room.guestAnswers,
            questions: room.questions
          });

          // Cleanup
          playerFinished.delete(roomCode);
          roomPlayers.delete(roomCode);
          console.log(`[Socket] Game ended in room ${roomCode}. Winner: ${winner}`);
        }
      } catch (err) {
        console.error('[Socket] game:finished error', err);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${socket.id}`);

      // Find room this socket was in
      for (const [roomCode, players] of roomPlayers.entries()) {
        let disconnectedRole = null;
        if (players.host === socket.id) disconnectedRole = 'host';
        else if (players.guest === socket.id) disconnectedRole = 'guest';

        if (disconnectedRole) {
          io.to(roomCode).emit('game:playerDisconnected', { role: disconnectedRole });

          // Auto-finish after timeout
          setTimeout(async () => {
            try {
              const room = await BattleRoom.findOne({ roomCode });
              if (room && room.status === 'playing') {
                const winner = disconnectedRole === 'host' ? 'guest' : 'host';
                room.status = 'finished';
                room.winner = winner;
                await room.save();

                io.to(roomCode).emit('game:result', {
                  winner,
                  hostScore: room.hostScore,
                  guestScore: room.guestScore,
                  hostTime: room.hostTime,
                  guestTime: room.guestTime,
                  hostName: room.hostName,
                  guestName: room.guestName,
                  disconnected: disconnectedRole,
                  hostAnswers: room.hostAnswers,
                  guestAnswers: room.guestAnswers,
                  questions: room.questions
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

