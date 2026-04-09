import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const levels = [
  {
    id: 'N5',
    title: 'JLPT N5',
    description: 'Basic Kanji',
    color: 'from-blue-400 to-indigo-500',
    shadow: 'shadow-blue-200',
  },
  {
    id: 'N4',
    title: 'JLPT N4',
    description: 'Elementary Kanji',
    color: 'from-emerald-400 to-teal-500',
    shadow: 'shadow-emerald-200',
  },
  {
    id: 'N3',
    title: 'JLPT N3',
    description: 'Intermediate Kanji',
    color: 'from-sakura-400 to-sakura-600',
    shadow: 'shadow-sakura-200',
  },
] as const;

const gameModes = [
  {
    id: 'mcq',
    title: 'Trắc nghiệm',
    emoji: '📝',
    description: 'Chọn đáp án từ 4 lựa chọn. Hỗ trợ cách đọc, nghĩa, và nhận diện Kanji.',
    color: 'from-violet-400 to-purple-500',
    shadow: 'shadow-violet-200',
    path: '/quiz/mcq',
    requireAuth: true,
  },
  {
    id: 'battle',
    title: 'Đấu Solo',
    emoji: '⚔️',
    description: 'Thi đấu 1v1 với bạn bè. Cùng bộ đề, ai nhanh và đúng hơn thắng!',
    color: 'from-rose-400 to-pink-500',
    shadow: 'shadow-rose-200',
    path: '/battle',
    requireAuth: true,
  },
  {
    id: 'leaderboard',
    title: 'Bảng xếp hạng',
    emoji: '🏆',
    description: 'Xem top người chơi giỏi nhất. Cạnh tranh để lên hạng!',
    color: 'from-amber-400 to-orange-500',
    shadow: 'shadow-amber-200',
    path: '/leaderboard',
    requireAuth: false,
  },
] as const;

export default function Home() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [packSize, setPackSize] = useState<number>(10);

  const handleLevelSelect = (levelId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/quiz?level=${levelId}&limit=${packSize}`);
  };

  const handleModeSelect = (mode: typeof gameModes[number]) => {
    if (mode.requireAuth && !user) {
      navigate('/login');
      return;
    }
    navigate(mode.path);
  };

  return (
    <div className="flex-1 flex flex-col items-center p-6 w-full animate-fade-in-up">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600 mb-4 tracking-tight">
          Kanji Master
        </h1>
        <p className="text-xl text-gray-500 font-medium tracking-wide">
          Chinh phục Kanji với nhiều chế độ học tập thú vị
        </p>
      </div>

      {/* Game Modes Section */}
      <div className="w-full max-w-5xl mb-16">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl font-extrabold text-gray-800">🎮 Chế độ chơi</h2>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {gameModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleModeSelect(mode)}
              className={`relative group bg-white rounded-3xl p-8 text-left transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl border border-gray-100 shadow-lg overflow-hidden`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="text-5xl mb-4">{mode.emoji}</div>
              
              <h3 className={`text-2xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-br ${mode.color}`}>
                {mode.title}
              </h3>
              
              <p className="text-gray-500 text-sm mb-6 relative z-10 leading-relaxed">
                {mode.description}
              </p>

              <div className="flex items-center justify-between mt-auto relative z-10">
                {mode.requireAuth && !user ? (
                  <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-bold">
                    Cần đăng nhập
                  </span>
                ) : (
                  <span className="text-xs bg-gray-50 text-gray-500 px-3 py-1 rounded-full font-semibold border border-gray-200">
                    Chơi ngay
                  </span>
                )}
                <span className={`w-10 h-10 rounded-full bg-gradient-to-br ${mode.color} text-white flex items-center justify-center transform group-hover:translate-x-2 transition-transform duration-300 shadow-lg`}>
                  &rarr;
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Classic Quiz Section */}
      <div className="w-full max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl font-extrabold text-gray-800">📚 Quiz gõ Romaji (Classic)</h2>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="mb-8 bg-white/80 backdrop-blur-md px-8 py-4 rounded-3xl shadow-sm border border-white flex flex-col sm:flex-row items-center gap-4">
          <label className="text-gray-700 font-bold">Số câu:</label>
          <div className="flex gap-3">
            <button
              onClick={() => setPackSize(10)}
              className={`px-6 py-2 rounded-xl font-bold transition-colors ${
                packSize === 10 
                  ? 'bg-sakura-100 text-sakura-700 border-2 border-sakura-200' 
                  : 'bg-gray-50 text-gray-500 border-2 border-transparent hover:bg-gray-100'
              }`}
            >
              10 câu
            </button>
            <button
              onClick={() => setPackSize(20)}
              className={`px-6 py-2 rounded-xl font-bold transition-colors ${
                packSize === 20 
                  ? 'bg-sakura-100 text-sakura-700 border-2 border-sakura-200' 
                  : 'bg-gray-50 text-gray-500 border-2 border-transparent hover:bg-gray-100'
              }`}
            >
              20 câu
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {levels.map((level) => (
            <button
              key={level.id}
              onClick={() => handleLevelSelect(level.id)}
              className={`relative group bg-white rounded-3xl p-8 text-left transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:${level.shadow} border border-gray-100 shadow-xl overflow-hidden`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${level.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
              ></div>
              <div className={`text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-br ${level.color}`}>
                {level.id}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2 relative z-10">
                {level.title}
              </h2>
              <p className="text-gray-500 mb-6 relative z-10">{level.description}</p>
              <div className="flex items-center justify-between mt-auto relative z-10">
                <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-gray-50 text-sm font-semibold text-gray-600 border border-gray-200">
                  Play {packSize} Random
                </span>
                <span className={`w-10 h-10 rounded-full bg-gradient-to-br ${level.color} text-white flex items-center justify-center transform group-hover:translate-x-2 transition-transform duration-300 shadow-lg`}>
                  &rarr;
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
