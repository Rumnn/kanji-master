import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { Settings, CheckCircle2, Play, Users, Link } from 'lucide-react';

const LEVELS = [
  { id: 'N5', label: 'N5', color: 'from-blue-400 to-indigo-500' },
  { id: 'N4', label: 'N4', color: 'from-emerald-400 to-teal-500' },
  { id: 'N3', label: 'N3', color: 'from-sakura-400 to-sakura-600' },
];

const QUESTION_TYPES = [
  { label: '🔀 Hỗn hợp', value: 'mixed' },
  { label: '📖 Đọc', value: 'reading' },
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

  // Join room state
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Room state (after create/join)
  const [roomCode, setRoomCode] = useState('');
  const [roomState, setRoomState] = useState<'idle' | 'waiting' | 'countdown'>('idle');
  const [hostName, setHostName] = useState('');
  const [guestName, setGuestName] = useState('');
  const [role, setRole] = useState<'host' | 'guest'>('host');
  const [guestReady, setGuestReady] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Lobby Settings
  const [settings, setSettings] = useState({
    level: 'N5',
    questionCount: 10,
    questionType: 'mixed',
    timePerQuestion: 10
  });

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // Emit setting changes (with debounce/throttling implicitly or directly)
  const updateSetting = (key: string, value: any) => {
    if (role !== 'host') return;
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    socket?.emit('room:update_settings', {
      roomCode,
      settings: newSettings,
      role: 'host'
    });
  };

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('room:joined', (data: any) => {
      setRole(data.role);
      setRoomCode(data.roomCode);
      setHostName(data.hostName);
      setGuestName(data.guestName || '');
      setGuestReady(data.guestReady || false);
      if (data.settings) setSettings(data.settings);
      setRoomState('waiting');
      setLoading(false);
      setError('');
    });

    socket.on('room:updated', (data: any) => {
      setHostName(data.hostName);
      setGuestName(data.guestName || '');
      setGuestReady(data.guestReady || false);
      if (data.settings) setSettings(data.settings);
    });

    socket.on('room:settings_updated', (data: any) => {
      setSettings(data.settings);
      setGuestReady(data.guestReady);
    });

    socket.on('room:guest_ready', (data: any) => {
      setGuestReady(data.guestReady);
    });

    socket.on('room:error', (data: any) => {
      setError(data.message);
      setLoading(false);
    });

    socket.on('game:countdown', (data: any) => {
      setRoomState('countdown');
      setCountdown(data.seconds);
      // Client-side visual countdown
      let c = data.seconds;
      const t = setInterval(() => {
        c -= 1;
        if (c > 0) setCountdown(c);
        else clearInterval(t);
      }, 1000);
    });

    socket.on('game:started', (data: any) => {
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
      socket.off('room:settings_updated');
      socket.off('room:guest_ready');
      socket.off('room:error');
      socket.off('game:countdown');
      socket.off('game:started');
    };
  }, [socket, roomCode, role, hostName, guestName, navigate]);

  const handleCreateRoom = async () => {
    setLoading(true);
    setError('');
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      // Simply create room with defaults
      const { data } = await axios.post('/api/battle/create', {}, config);
      
      socket?.emit('room:join', {
        roomCode: data.roomCode,
        userId: user?._id,
        userName: user?.fullName
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tạo phòng.');
      setLoading(false);
    }
  };

  const handleJoinRoom = () => {
    if (!joinCode.trim() || joinCode.trim().length !== 6) {
      setError('Vui lòng nhập mã phòng 6 ký tự.');
      return;
    }
    setLoading(true);
    setError('');

    socket?.emit('room:join', {
      roomCode: joinCode.trim().toUpperCase(),
      userId: user?._id,
      userName: user?.fullName
    });
  };

  const handleToggleReady = () => {
    if (role !== 'guest') return;
    socket?.emit('room:toggle_ready', { roomCode, role: 'guest' });
  };

  const handleStartGame = () => {
    if (role !== 'host') return;
    socket?.emit('game:start', { roomCode, role: 'host' });
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
  };

  // COUNTDOWN STATE
  if (roomState === 'countdown') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center animate-fade-in">
        <h2 className="text-4xl font-bold text-gray-800 mb-8 blur-sm">Trận đấu bắt đầu sau...</h2>
        <div className="relative">
          <div className="absolute inset-0 bg-sakura-500 rounded-full blur-xl animate-pulse opacity-50"></div>
          <div className="w-48 h-48 bg-gradient-to-br from-sakura-400 to-sakura-600 rounded-full flex items-center justify-center text-white text-9xl font-black shadow-2xl relative z-10 animate-bounce">
            {countdown}
          </div>
        </div>
      </div>
    );
  }

  // LOBBY / WAITING ROOM
  if (roomState === 'waiting') {
    return (
      <div className="max-w-6xl mx-auto animate-fade-in-up">
        {/* Header bar */}
        <div className="bg-white/90 backdrop-blur-xl rounded-full shadow-sm p-4 px-8 border border-white/40 flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">⚔️ Phòng đấu</h2>
            <div className="h-6 w-px bg-gray-200 mx-2" />
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-1.5 cursor-pointer hover:bg-gray-200 transition-colors" onClick={copyRoomCode}>
              <span className="text-xs font-bold text-gray-400 mr-2 uppercase tracking-wider">CODE</span>
              <span className="font-black text-sakura-600 tracking-widest">{roomCode}</span>
              <Link size={14} className="ml-2 text-gray-400" />
            </div>
          </div>
          <button onClick={() => { setRoomState('idle'); setRoomCode(''); }} className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">
            Thoát phòng
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: HOST */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-lg p-8 border border-white/40 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="text-center z-10">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-4xl font-black shadow-xl mx-auto mb-4 border-4 border-white">
                {hostName.charAt(0).toUpperCase()}
              </div>
              <p className="text-2xl font-black text-gray-800">{hostName}</p>
              <div className="mt-2 inline-flex items-center bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                👑 Chủ phòng
              </div>
            </div>
          </div>

          {/* MIDDLE: SETTINGS */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-lg p-8 border border-white/40 flex flex-col relative z-20">
            <div className="flex flex-col flex-grow space-y-6">
              <div className="flex items-center text-gray-800 font-black text-lg border-b border-gray-100 pb-3">
                <Settings className="text-sakura-500 mr-2" /> Thiết lập luật chơi
              </div>

              {/* LEVEL */}
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Cấp độ (JLPT)</label>
                <div className="flex gap-2">
                  {LEVELS.map((l) => (
                    <button
                      key={l.id}
                      disabled={role !== 'host'}
                      onClick={() => updateSetting('level', l.id)}
                      className={`flex-1 py-3 px-2 rounded-xl font-bold text-sm transition-all ${
                        settings.level === l.id
                          ? `bg-gradient-to-br ${l.color} text-white shadow-md transform scale-105`
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                      } ${role !== 'host' ? 'cursor-default' : ''}`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tùy chọn 2 cột */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Số câu</label>
                  <select 
                    value={settings.questionCount}
                    onChange={(e) => updateSetting('questionCount', parseInt(e.target.value))}
                    disabled={role !== 'host'}
                    className="w-full bg-gray-50 border-none rounded-xl p-3 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-sakura-200 disabled:opacity-80 disabled:cursor-default"
                  >
                    <option value={5}>5 câu</option>
                    <option value={10}>10 câu</option>
                    <option value={15}>15 câu</option>
                    <option value={20}>20 câu (Hard)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Thời gian</label>
                  <select 
                    value={settings.timePerQuestion}
                    onChange={(e) => updateSetting('timePerQuestion', parseInt(e.target.value))}
                    disabled={role !== 'host'}
                    className="w-full bg-gray-50 border-none rounded-xl p-3 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-sakura-200 disabled:opacity-80 disabled:cursor-default"
                  >
                    {TIMER_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Loại câu hỏi */}
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Loại câu hỏi</label>
                <div className="grid grid-cols-2 gap-2">
                  {QUESTION_TYPES.map((qt) => (
                    <button
                      key={qt.value}
                      disabled={role !== 'host'}
                      onClick={() => updateSetting('questionType', qt.value)}
                      className={`p-2.5 rounded-xl font-bold text-xs transition-all ${
                        settings.questionType === qt.value
                          ? 'bg-sakura-100 text-sakura-700 shadow-inner'
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                      } ${role !== 'host' ? 'cursor-default' : ''}`}
                    >
                      {qt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* INFO for guest */}
              {role === 'guest' && (
                <p className="text-xs text-center text-amber-600 font-bold bg-amber-50 rounded-lg py-2 mt-auto">
                  🔒 Chỉ Chủ phòng mới có thể thay đổi thiết lập
                </p>
              )}
            </div>
            
            {error && <div className="mt-4 p-3 bg-rose-50 text-rose-600 text-sm font-bold rounded-xl text-center">{error}</div>}

            {/* ACTION BUTTON */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              {role === 'host' ? (
                <button
                  onClick={handleStartGame}
                  disabled={!guestName || !guestReady}
                  className={`w-full py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center ${
                    (!guestName || !guestReady)
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-sakura-500 to-sakura-600 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1'
                  }`}
                >
                  <Play className="mr-2" fill="currentColor" /> {(!guestName) ? 'Chờ đối thủ...' : (!guestReady ? 'Chờ Guest sẵn sàng...' : 'Bắt đầu trận đấu!')}
                </button>
              ) : (
                <button
                  onClick={handleToggleReady}
                  className={`w-full py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center ${
                    guestReady
                    ? 'bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 hover:-translate-y-1'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {guestReady ? <><CheckCircle2 className="mr-2" /> Đã sẵn sàng</> : 'Nhấn để Sẵn sàng'}
                </button>
              )}
            </div>
          </div>

          {/* RIGHT: GUEST */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-lg p-8 border border-white/40 flex flex-col items-center justify-center relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 transition-colors duration-500 ${guestReady ? 'bg-emerald-500/20' : 'bg-gray-500/10'}`}></div>
            
            {guestName ? (
              <div className="text-center z-10 transition-all duration-300">
                <div className="relative inline-block mb-4">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-black shadow-xl border-4 ${guestReady ? 'border-emerald-400 bg-gradient-to-br from-emerald-400 to-teal-500' : 'border-white bg-gray-300'}`}>
                    {guestName.charAt(0).toUpperCase()}
                  </div>
                  {/* Ready Badge */}
                  {guestReady && (
                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-lg animate-bounce">
                      <CheckCircle2 className="text-emerald-500 w-8 h-8" fill="currentColor" opacity="0.2" />
                    </div>
                  )}
                </div>
                <p className="text-2xl font-black text-gray-800">{guestName}</p>
                <div className={`mt-2 inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black border uppercase tracking-wider transition-colors ${
                  guestReady ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-gray-100 text-gray-500 border-gray-200'
                }`}>
                  {guestReady ? 'Sẵn sàng!' : 'Chưa sẵn sàng'}
                </div>
              </div>
            ) : (
              <div className="text-center z-10">
                <div className="w-24 h-24 rounded-full bg-gray-50 border-4 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-4xl mx-auto mb-4 relative overflow-hidden animate-pulse">
                  <Users opacity="0.3"/>
                </div>
                <p className="text-gray-400 font-bold">Đang chờ đối thủ...</p>
                <div className="mt-2 text-xs text-gray-400 px-4 py-2 bg-gray-50 rounded-lg">Gửi mã phòng cho bạn bè!</div>
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  // IDLE (CREATE / JOIN SCREEN)
  return (
    <div className="max-w-xl mx-auto animate-fade-in-up">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sakura-500 to-sakura-600 mb-3 leading-tight pb-2">
          ⚔️ Đấu Online
        </h1>
        <p className="text-gray-500 font-medium">So tài Kanji cùng bạn bè bốn phương</p>
        {!isConnected && (
          <p className="text-rose-500 text-sm mt-3 font-bold flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-rose-500 mr-2 animate-ping"></div> Đang kết nối server...</p>
        )}
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl p-8 border border-white/50 relative overflow-hidden">
        {/* BG decorative */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-sakura-300/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
          <button
            onClick={() => setTab('create')}
            className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${
              tab === 'create' ? 'bg-white text-sakura-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🏠 Tạo phòng mới
          </button>
          <button
            onClick={() => setTab('join')}
            className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${
              tab === 'join' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🔗 Nhập mã phòng
          </button>
        </div>

        {tab === 'create' ? (
          <div className="text-center py-6">
            <div className="w-20 h-20 bg-sakura-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-sakura-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Tạo phòng nhanh chóng!</h3>
            <p className="text-gray-500 text-sm mb-8">Bạn sẽ là chủ phòng và có quyền thiết lập các luật chơi (Cấp độ, thời gian...) sau khi tạo.</p>
            
            {error && <p className="text-rose-500 font-bold text-sm bg-rose-50 p-3 rounded-xl mb-6">{error}</p>}

            <button
              onClick={handleCreateRoom}
              disabled={loading || !isConnected}
              className="w-full px-8 py-4 bg-gradient-to-r from-sakura-500 to-sakura-600 text-white rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? '⏳ Đang khởi tạo...' : 'Tạo phòng ngay'}
            </button>
          </div>
        ) : (
          <div className="text-center py-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Nhập mã phòng từ bạn bè</h3>

            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="VD: ABCD12"
              maxLength={6}
              className="w-full text-center text-4xl font-black tracking-widest p-4 border-2 border-gray-200 rounded-2xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all outline-none uppercase placeholder-gray-200 mb-6"
            />

            {error && <p className="text-rose-500 font-bold mt-2 mb-6">{error}</p>}

            <button
              onClick={handleJoinRoom}
              disabled={loading || !isConnected || joinCode.length !== 6}
              className="w-full px-8 py-4 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? '⏳ Đang kết nối...' : 'Tham gia'}
            </button>
          </div>
        )}
      </div>

      <div className="text-center mt-6">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600 font-medium transition-colors text-sm">
          ← Về trang chủ
        </button>
      </div>
    </div>
  );
}
