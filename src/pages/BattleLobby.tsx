import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';

const LEVELS = [
  { id: 'N5', label: 'N5', color: 'from-blue-400 to-indigo-500' },
  { id: 'N4', label: 'N4', color: 'from-emerald-400 to-teal-500' },
  { id: 'N3', label: 'N3', color: 'from-sakura-400 to-sakura-600' },
];

const QUESTION_TYPES = [
  { label: '🔀 Hỗn hợp', value: 'mixed' },
  { label: '📖 Cách đọc', value: 'reading' },
  { label: '💡 Nghĩa', value: 'meaning' },
  { label: '🈶 Kanji', value: 'kanji' },
];

const TIMER_OPTIONS = [
  { label: '5s', value: 5 },
  { label: '10s', value: 10 },
  { label: '15s', value: 15 },
  { label: '20s', value: 20 },
];

export default function BattleLobby() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { socket, isConnected } = useContext(SocketContext);

  const [tab, setTab] = useState<'create' | 'join'>('create');

  // Create room state
  const [level, setLevel] = useState('N5');
  const [questionCount, setQuestionCount] = useState(10);
  const [questionType, setQuestionType] = useState('mixed');
  const [timePerQuestion, setTimePerQuestion] = useState(10);
  const [creating, setCreating] = useState(false);

  // Join room state
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);

  // Room state (after create/join)
  const [roomCode, setRoomCode] = useState('');
  const [roomState, setRoomState] = useState<'idle' | 'waiting' | 'starting'>('idle');
  const [hostName, setHostName] = useState('');
  const [guestName, setGuestName] = useState('');
  const [role, setRole] = useState<'host' | 'guest'>('host');
  const [error, setError] = useState('');

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('room:joined', (data: any) => {
      setRole(data.role);
      setRoomCode(data.roomCode);
      setHostName(data.hostName);
      setGuestName(data.guestName || '');
      setRoomState('waiting');
      setJoining(false);
      setCreating(false);
      setError('');
    });

    socket.on('room:updated', (data: any) => {
      setHostName(data.hostName);
      setGuestName(data.guestName || '');
    });

    socket.on('room:error', (data: any) => {
      setError(data.message);
      setJoining(false);
      setCreating(false);
    });

    socket.on('game:started', (data: any) => {
      // Navigate to battle play page
      navigate(`/battle/${roomCode}/play`, {
        state: {
          questions: data.questions,
          timePerQuestion: data.timePerQuestion,
          questionCount: data.questionCount,
          role,
          roomCode,
          hostName,
          guestName,
        }
      });
    });

    return () => {
      socket.off('room:joined');
      socket.off('room:updated');
      socket.off('room:error');
      socket.off('game:started');
    };
  }, [socket, roomCode, role, hostName, guestName, navigate]);

  const handleCreateRoom = async () => {
    setCreating(true);
    setError('');
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const { data } = await axios.post('/api/battle/create', {
        level,
        questionCount,
        questionType,
        timePerQuestion
      }, config);

      setRoomCode(data.roomCode);

      // Join the room via socket
      socket?.emit('room:join', {
        roomCode: data.roomCode,
        userId: user?._id,
        userName: user?.fullName
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tạo phòng.');
      setCreating(false);
    }
  };

  const handleJoinRoom = () => {
    if (!joinCode.trim() || joinCode.trim().length !== 6) {
      setError('Vui lòng nhập mã phòng 6 ký tự.');
      return;
    }
    setJoining(true);
    setError('');

    socket?.emit('room:join', {
      roomCode: joinCode.trim().toUpperCase(),
      userId: user?._id,
      userName: user?.fullName
    });
  };

  const handleStartGame = () => {
    socket?.emit('game:start', { roomCode });
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
  };

  // WAITING ROOM
  if (roomState === 'waiting') {
    return (
      <div className="max-w-xl mx-auto animate-fade-in-up">
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl p-10 border border-white/40 text-center">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-2">⚔️ Phòng đấu</h2>

          {/* Room code */}
          <div className="mt-6 mb-8">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Mã phòng</p>
            <div className="flex items-center justify-center gap-3">
              <div className="text-5xl font-black tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-sakura-500 to-sakura-600">
                {roomCode}
              </div>
              <button
                onClick={copyRoomCode}
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                title="Copy"
              >
                📋
              </button>
            </div>
            <p className="text-gray-400 text-sm mt-2">Chia sẻ mã này cho đối thủ</p>
          </div>

          {/* Players */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-black shadow-lg mx-auto mb-2">
                {hostName.charAt(0).toUpperCase()}
              </div>
              <p className="font-bold text-gray-800">{hostName}</p>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">Host</span>
            </div>

            <div className="text-4xl font-black text-gray-300">VS</div>

            <div className="text-center">
              {guestName ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl font-black shadow-lg mx-auto mb-2">
                    {guestName.charAt(0).toUpperCase()}
                  </div>
                  <p className="font-bold text-gray-800">{guestName}</p>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Guest</span>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-2xl mx-auto mb-2 animate-pulse">
                    ?
                  </div>
                  <p className="text-gray-400 font-medium">Đang chờ...</p>
                </>
              )}
            </div>
          </div>

          {/* Start button (host only) */}
          {role === 'host' ? (
            <button
              onClick={handleStartGame}
              disabled={!guestName}
              className="w-full px-8 py-4 bg-gradient-to-r from-sakura-500 to-sakura-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
            >
              {guestName ? '🚀 Bắt đầu trận đấu!' : '⏳ Chờ đối thủ...'}
            </button>
          ) : (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
              <p className="text-amber-700 font-bold">⏳ Chờ host bắt đầu trận đấu...</p>
            </div>
          )}

          <button
            onClick={() => { setRoomState('idle'); setRoomCode(''); }}
            className="mt-4 text-gray-400 hover:text-gray-600 font-medium transition-colors"
          >
            ← Quay lại Lobby
          </button>
        </div>
      </div>
    );
  }

  // LOBBY (CREATE / JOIN)
  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sakura-500 to-sakura-600 mb-3">
          ⚔️ Đấu Solo
        </h1>
        <p className="text-gray-500 text-lg font-medium">Thi đấu Kanji với bạn bè</p>
        {!isConnected && (
          <p className="text-rose-500 text-sm mt-2 font-bold">⚠️ Đang kết nối server...</p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex mb-8 bg-gray-100 rounded-2xl p-1.5">
        <button
          onClick={() => setTab('create')}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
            tab === 'create' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🏠 Tạo phòng
        </button>
        <button
          onClick={() => setTab('join')}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
            tab === 'join' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🔗 Nhập mã phòng
        </button>
      </div>

      {tab === 'create' ? (
        <div className="space-y-6">
          {/* Level */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-sm">
            <h3 className="text-sm font-bold text-gray-600 mb-3 uppercase tracking-wider">Cấp độ</h3>
            <div className="flex gap-3">
              {LEVELS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLevel(l.id)}
                  className={`flex-1 p-3 rounded-xl font-bold transition-all ${
                    level === l.id
                      ? `bg-gradient-to-br ${l.color} text-white shadow-md`
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question type + count */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-sm">
              <h3 className="text-sm font-bold text-gray-600 mb-3 uppercase tracking-wider">Loại câu hỏi</h3>
              <div className="grid grid-cols-2 gap-2">
                {QUESTION_TYPES.map((qt) => (
                  <button
                    key={qt.value}
                    onClick={() => setQuestionType(qt.value)}
                    className={`p-2 rounded-lg font-bold text-xs transition-all ${
                      questionType === qt.value
                        ? 'bg-sakura-50 text-sakura-700 border border-sakura-200'
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {qt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-sm">
              <h3 className="text-sm font-bold text-gray-600 mb-3 uppercase tracking-wider">Số câu & Thời gian</h3>
              <div className="flex gap-2 mb-3">
                {[5, 10, 15].map((n) => (
                  <button
                    key={n}
                    onClick={() => setQuestionCount(n)}
                    className={`flex-1 p-2 rounded-lg font-bold text-xs transition-all ${
                      questionCount === n
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {n} câu
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {TIMER_OPTIONS.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTimePerQuestion(t.value)}
                    className={`flex-1 p-2 rounded-lg font-bold text-xs transition-all ${
                      timePerQuestion === t.value
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && <p className="text-rose-500 font-bold text-center bg-rose-50 p-3 rounded-xl">{error}</p>}

          <button
            onClick={handleCreateRoom}
            disabled={creating || !isConnected}
            className="w-full px-8 py-4 bg-gradient-to-r from-sakura-500 to-sakura-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50"
          >
            {creating ? '⏳ Đang tạo...' : '🏠 Tạo phòng đấu'}
          </button>
        </div>
      ) : (
        /* JOIN TAB */
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-10 border border-white/50 shadow-sm text-center">
          <div className="text-6xl mb-6">🔗</div>
          <h3 className="text-xl font-bold text-gray-800 mb-6">Nhập mã phòng đấu</h3>

          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
            placeholder="VD: ABC123"
            maxLength={6}
            className="w-full text-center text-4xl font-black tracking-[0.3em] p-4 border-2 border-gray-200 rounded-2xl focus:border-sakura-400 focus:ring-4 focus:ring-sakura-100 transition-all outline-none uppercase placeholder-gray-300"
          />

          {error && <p className="text-rose-500 font-bold mt-4">{error}</p>}

          <button
            onClick={handleJoinRoom}
            disabled={joining || !isConnected || joinCode.length !== 6}
            className="w-full mt-6 px-8 py-4 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50"
          >
            {joining ? '⏳ Đang tham gia...' : '🚀 Tham gia phòng'}
          </button>
        </div>
      )}

      <div className="text-center mt-6">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600 font-medium transition-colors">
          ← Quay lại trang chủ
        </button>
      </div>
    </div>
  );
}
