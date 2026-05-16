import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

interface QuizRecord {
  _id: string;
  quizName: string;
  score: number;
  totalQuestions: number;
  createdAt: string;
}

interface ProgressSummary {
  itemType: 'kanji' | 'it_vocab';
  learnedItems: number;
  attempts: number;
  correct: number;
  incorrect: number;
  averageMastery: number;
  accuracy: number;
}

interface HardItem {
  _id: string;
  itemType: 'kanji' | 'it_vocab';
  label: string;
  level?: string;
  category?: string;
  attempts: number;
  correct: number;
  incorrect: number;
  mastery: number;
}

interface ProgressDashboard {
  summary: ProgressSummary[];
  byLevel: Array<{
    level: string;
    learnedItems: number;
    attempts: number;
    correct: number;
    incorrect: number;
    averageMastery: number;
    accuracy: number;
  }>;
  hardestItems: HardItem[];
  dueCount: number;
  streakDays: number;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState<QuizRecord[]>([]);
  const [progress, setProgress] = useState<ProgressDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        };
        const [historyRes, progressRes] = await Promise.all([
          axios.get('/api/history', config),
          axios.get('/api/progress/summary', config)
        ]);

        setHistory(historyRes.data);
        setProgress(progressRes.data);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchHistory();
    }
  }, [user]);

  const totals = progress?.summary.reduce(
    (acc, item) => ({
      learnedItems: acc.learnedItems + item.learnedItems,
      attempts: acc.attempts + item.attempts,
      correct: acc.correct + item.correct,
    }),
    { learnedItems: 0, attempts: 0, correct: 0 }
  ) || { learnedItems: 0, attempts: 0, correct: 0 };

  const overallAccuracy = totals.attempts > 0
    ? Math.round((totals.correct / totals.attempts) * 100)
    : 0;

  const kanjiSummary = progress?.summary.find((item) => item.itemType === 'kanji');
  const itSummary = progress?.summary.find((item) => item.itemType === 'it_vocab');

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-white p-8 mb-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-sakura-400 to-sakura-600 flex items-center justify-center text-white text-3xl font-black shadow-lg">
            {user?.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">
              {user?.fullName}
            </h1>
            <p className="text-gray-500 font-medium mt-1">{user?.email}</p>
            <div className="mt-3 px-3 py-1 bg-gray-100 inline-block rounded-full text-xs font-bold text-gray-600 uppercase tracking-wider">
              {user?.role} student
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/75 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-sm">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Đã học</p>
          <p className="text-3xl font-black text-gray-800">{totals.learnedItems}</p>
          <p className="text-xs text-gray-400 mt-1">Kanji + IT vocab</p>
        </div>
        <div className="bg-white/75 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-sm">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Độ chính xác</p>
          <p className="text-3xl font-black text-jade-500">{overallAccuracy}%</p>
          <p className="text-xs text-gray-400 mt-1">{totals.attempts} lượt trả lời</p>
        </div>
        <div className="bg-white/75 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-sm">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Cần ôn</p>
          <p className="text-3xl font-black text-amber-500">{progress?.dueCount || 0}</p>
          <p className="text-xs text-gray-400 mt-1">Theo lịch ôn tập</p>
        </div>
        <div className="bg-white/75 backdrop-blur-xl rounded-2xl p-5 border border-white/60 shadow-sm">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Bài quiz</p>
          <p className="text-3xl font-black text-sakura-500">{progress?.streakDays || 0}</p>
          <p className="text-xs text-gray-400 mt-1">Đã hoàn thành</p>
        </div>
      </div>

      <div className="bg-white/75 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-sm mb-8">
        <div className="flex items-center justify-between gap-4 mb-5">
          <h2 className="text-xl font-black text-gray-800">Tien do theo JLPT</h2>
          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{history.length} quiz</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {['N5', 'N4', 'N3', 'N2', 'N1'].map((levelName) => {
            const row = progress?.byLevel?.find((item) => item.level === levelName);
            return (
              <div key={levelName} className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-black text-gray-800">{levelName}</span>
                  <span className="text-xs font-bold text-jade-600">{row?.accuracy || 0}%</span>
                </div>
                <p className="text-2xl font-black text-gray-800">{row?.learnedItems || 0}</p>
                <p className="text-xs text-gray-400">muc da hoc</p>
                <div className="h-2 bg-white rounded-full overflow-hidden mt-3 border border-gray-100">
                  <div
                    className="h-full bg-jade-500 rounded-full"
                    style={{ width: `${Math.min(row?.accuracy || 0, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl p-6 text-white shadow-lg shadow-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-emerald-100 mb-2">Spaced repetition</p>
          <h2 className="text-2xl font-black">Ôn tập hôm nay</h2>
          <p className="text-sm text-emerald-50 mt-1">
            {progress?.dueCount || 0} mục đang đến hạn ôn trong lịch học cá nhân.
          </p>
        </div>
        <button
          onClick={() => navigate('/review')}
          className="px-6 py-3 rounded-xl bg-white text-emerald-700 font-black hover:bg-emerald-50 transition-colors shadow-sm"
        >
          Bắt đầu ôn
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <div className="bg-white/75 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-sm">
          <h2 className="text-xl font-black text-gray-800 mb-4">Tổng quan nội dung</h2>
          <div className="space-y-4">
            {[
              { label: 'Kanji', data: kanjiSummary, color: 'bg-sakura-500' },
              { label: 'IT Vocab', data: itSummary, color: 'bg-indigo-500' }
            ].map((row) => (
              <div key={row.label}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-gray-700">{row.label}</span>
                  <span className="text-sm font-bold text-gray-400">
                    {row.data?.learnedItems || 0} mục • {row.data?.accuracy || 0}%
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${row.color} rounded-full`}
                    style={{ width: `${Math.min(row.data?.accuracy || 0, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/75 backdrop-blur-xl rounded-3xl p-6 border border-white/60 shadow-sm">
          <h2 className="text-xl font-black text-gray-800 mb-4">Mục nên ôn lại</h2>
          {!progress || progress.hardestItems.length === 0 ? (
            <p className="text-gray-500 text-sm">Chơi thêm vài bài quiz để hệ thống tìm các mục bạn hay nhầm.</p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {progress.hardestItems.map((item) => {
                const accuracy = item.attempts > 0 ? Math.round((item.correct / item.attempts) * 100) : 0;
                return (
                  <div key={item._id} className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-xl font-black text-gray-800 jp-text border border-gray-100">
                      {item.label}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {item.itemType === 'kanji' ? 'Kanji' : 'IT Vocab'} {item.level || item.category ? `• ${item.level || item.category}` : ''}
                      </p>
                      <p className="text-xs text-gray-400">
                        Mastery {item.mastery}/5 • Sai {item.incorrect}/{item.attempts}
                      </p>
                    </div>
                    <div className="text-sm font-black text-rose-500">{accuracy}%</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <span className="bg-jade-100 text-jade-700 p-2 rounded-xl mr-3 shadow-sm">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
        </span>
        Your Learning Journey
      </h2>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-sakura-200 border-t-sakura-500"></div>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-gray-50/80 backdrop-blur-sm rounded-3xl border border-gray-200 border-dashed p-12 text-center">
          <div className="text-4xl mb-4">🌱</div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">No Quizzes Taken Yet</h3>
          <p className="text-gray-500">Go to the home page and start your first Kanji quiz to see your progress here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {history.map((record) => (
            <div key={record._id} className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-white/50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h4 className="text-lg font-bold text-gray-800">{record.quizName}</h4>
                <p className="text-sm text-gray-500 font-medium">
                  {new Date(record.createdAt).toLocaleDateString(undefined, {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Score</div>
                  <div className="text-2xl font-black text-gray-800">
                    <span className={record.score === record.totalQuestions ? 'text-jade-500' : 'text-sakura-500'}>
                      {record.score}
                    </span>
                    <span className="text-gray-300 mx-1">/</span>
                    {record.totalQuestions}
                  </div>
                </div>
                {/* Visual circle progress */}
                <div className="relative w-14 h-14">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle className="text-gray-100 stroke-current" strokeWidth="4" cx="28" cy="28" r="24" fill="transparent"></circle>
                    <circle 
                      className={`${record.score === record.totalQuestions ? 'text-jade-500' : 'text-sakura-500'} stroke-current`} 
                      strokeWidth="4" 
                      strokeDasharray={150.7} 
                      strokeDashoffset={150.7 - (150.7 * record.score) / record.totalQuestions}
                      strokeLinecap="round" 
                      cx="28" cy="28" r="24" fill="transparent"
                    ></circle>
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
