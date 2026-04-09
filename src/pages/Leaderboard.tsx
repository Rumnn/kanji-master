import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface LeaderEntry {
  _id: string;
  fullName: string;
  totalScore: number;
  totalQuestions: number;
  quizCount: number;
  bestScore: number;
  accuracy: number;
}

interface BattleEntry {
  _id: string;
  fullName: string;
  wins: number;
  totalBattles: number;
  winRate: number;
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'quiz' | 'battle'>('quiz');
  const [quizLeaderboard, setQuizLeaderboard] = useState<LeaderEntry[]>([]);
  const [battleLeaderboard, setBattleLeaderboard] = useState<BattleEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizRes, battleRes] = await Promise.all([
          axios.get('/api/leaderboard?limit=30'),
          axios.get('/api/leaderboard/battles?limit=30')
        ]);
        setQuizLeaderboard(quizRes.data);
        setBattleLeaderboard(battleRes.data);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getRankStyle = (index: number) => {
    if (index === 0) return 'bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-lg shadow-amber-200';
    if (index === 1) return 'bg-gradient-to-r from-gray-300 to-gray-400 text-white shadow-lg';
    if (index === 2) return 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg';
    return 'bg-gray-100 text-gray-600';
  };

  const getRankEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}`;
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500 mb-3">
          🏆 Bảng Xếp Hạng
        </h1>
        <p className="text-gray-500 text-lg font-medium">Top người chơi giỏi nhất</p>
      </div>

      {/* Tabs */}
      <div className="flex mb-8 bg-gray-100 rounded-2xl p-1.5">
        <button
          onClick={() => setTab('quiz')}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
            tab === 'quiz' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📝 Trắc nghiệm
        </button>
        <button
          onClick={() => setTab('battle')}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
            tab === 'battle' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          ⚔️ Đấu Solo
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-200 border-t-amber-500" />
        </div>
      ) : tab === 'quiz' ? (
        /* QUIZ LEADERBOARD */
        <div className="space-y-3">
          {quizLeaderboard.length === 0 ? (
            <div className="text-center py-16 bg-gray-50/80 rounded-3xl border border-dashed border-gray-200">
              <div className="text-4xl mb-4">🌱</div>
              <p className="text-gray-500 font-medium">Chưa có dữ liệu. Hãy chơi quiz đầu tiên!</p>
            </div>
          ) : (
            quizLeaderboard.map((entry, i) => (
              <div
                key={entry._id}
                className={`flex items-center gap-4 p-5 rounded-2xl transition-all hover:shadow-md ${
                  i < 3 ? 'bg-white/90 backdrop-blur-xl shadow-sm border border-white/50' : 'bg-white/60 backdrop-blur-md border border-white/30'
                }`}
              >
                {/* Rank */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shrink-0 ${getRankStyle(i)}`}>
                  {getRankEmoji(i)}
                </div>

                {/* Avatar */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg shadow-md ${
                  i === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
                  i === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                  i === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
                  'bg-gradient-to-br from-sakura-400 to-sakura-600'
                }`}>
                  {entry.fullName.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 truncate">{entry.fullName}</p>
                  <p className="text-xs text-gray-400 font-medium">{entry.quizCount} bài quiz • Chính xác {entry.accuracy}%</p>
                </div>

                {/* Score */}
                <div className="text-right">
                  <p className="text-2xl font-black text-gray-800">{entry.totalScore}</p>
                  <p className="text-xs text-gray-400 font-bold uppercase">Điểm</p>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* BATTLE LEADERBOARD */
        <div className="space-y-3">
          {battleLeaderboard.length === 0 ? (
            <div className="text-center py-16 bg-gray-50/80 rounded-3xl border border-dashed border-gray-200">
              <div className="text-4xl mb-4">⚔️</div>
              <p className="text-gray-500 font-medium">Chưa có trận đấu nào. Tạo phòng đấu đầu tiên!</p>
            </div>
          ) : (
            battleLeaderboard.map((entry, i) => (
              <div
                key={entry._id}
                className={`flex items-center gap-4 p-5 rounded-2xl transition-all hover:shadow-md ${
                  i < 3 ? 'bg-white/90 backdrop-blur-xl shadow-sm border border-white/50' : 'bg-white/60 backdrop-blur-md border border-white/30'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shrink-0 ${getRankStyle(i)}`}>
                  {getRankEmoji(i)}
                </div>

                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg shadow-md ${
                  i === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
                  i === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                  i === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
                  'bg-gradient-to-br from-emerald-400 to-teal-500'
                }`}>
                  {entry.fullName.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 truncate">{entry.fullName}</p>
                  <p className="text-xs text-gray-400 font-medium">{entry.totalBattles} trận • Tỉ lệ thắng {entry.winRate}%</p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-black text-emerald-500">{entry.wins}</p>
                  <p className="text-xs text-gray-400 font-bold uppercase">Thắng</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="text-center mt-8">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600 font-medium transition-colors">
          ← Quay lại trang chủ
        </button>
      </div>
    </div>
  );
}
