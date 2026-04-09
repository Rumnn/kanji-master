import { useLocation, useNavigate } from 'react-router-dom';

interface ResultState {
  winner: string;
  hostScore: number;
  guestScore: number;
  hostTime: number;
  guestTime: number;
  hostName: string;
  guestName: string;
  hostAnswers: any[];
  guestAnswers: any[];
  questions: any[];
  myRole: 'host' | 'guest';
  disconnected?: string;
}

export default function BattleResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultState;

  if (!state) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-xl">Không có dữ liệu trận đấu.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-sakura-500 font-bold hover:underline">Về trang chủ</button>
      </div>
    );
  }

  const {
    winner, hostScore, guestScore, hostTime, guestTime,
    hostName, guestName, hostAnswers, guestAnswers, questions, myRole, disconnected
  } = state;

  const iWon = winner === myRole;
  const isDraw = winner === 'draw';
  const myScore = myRole === 'host' ? hostScore : guestScore;
  const opponentScore = myRole === 'host' ? guestScore : hostScore;
  const myTime = myRole === 'host' ? hostTime : guestTime;
  const opponentTime = myRole === 'host' ? guestTime : hostTime;
  const myName = myRole === 'host' ? hostName : guestName;
  const opponentName = myRole === 'host' ? guestName : hostName;

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      {/* Winner banner */}
      <div className={`rounded-[2rem] p-10 text-center mb-8 shadow-2xl ${
        iWon
          ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 text-white'
          : isDraw
            ? 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 text-white'
            : 'bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500 text-white'
      }`}>
        <div className="text-7xl mb-4">
          {iWon ? '🏆' : isDraw ? '🤝' : '💪'}
        </div>
        <h1 className="text-4xl font-extrabold mb-2">
          {disconnected
            ? `Đối thủ đã ngắt kết nối!`
            : iWon
              ? 'Chiến thắng!'
              : isDraw
                ? 'Hòa!'
                : 'Thua cuộc!'
          }
        </h1>
        <p className="text-white/80 font-medium text-lg">
          {iWon ? 'Bạn đã vượt trội hơn đối thủ!' : isDraw ? 'Cả hai đều rất giỏi!' : 'Lần sau sẽ tốt hơn!'}
        </p>
      </div>

      {/* Score comparison */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/50 p-8 mb-8">
        <div className="flex items-center justify-between gap-4">
          {/* My side */}
          <div className="flex-1 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-black shadow-lg mx-auto mb-3">
              {myName.charAt(0).toUpperCase()}
            </div>
            <p className="font-bold text-gray-800 mb-1">{myName}</p>
            <p className="text-xs text-gray-400 font-bold uppercase mb-3">Bạn</p>
            <div className="text-5xl font-black text-indigo-500 mb-2">{myScore}</div>
            <p className="text-gray-500 text-sm font-medium">/ {questions.length} câu</p>
            <div className="mt-3 p-2 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 font-bold uppercase">Thời gian</p>
              <p className="text-lg font-bold text-gray-700">{formatTime(myTime)}</p>
            </div>
          </div>

          {/* VS */}
          <div className="px-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sakura-400 to-sakura-600 flex items-center justify-center shadow-xl">
              <span className="text-white font-black">VS</span>
            </div>
          </div>

          {/* Opponent */}
          <div className="flex-1 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl font-black shadow-lg mx-auto mb-3">
              {opponentName?.charAt(0).toUpperCase() || '?'}
            </div>
            <p className="font-bold text-gray-800 mb-1">{opponentName}</p>
            <p className="text-xs text-gray-400 font-bold uppercase mb-3">Đối thủ</p>
            <div className="text-5xl font-black text-teal-500 mb-2">{opponentScore}</div>
            <p className="text-gray-500 text-sm font-medium">/ {questions.length} câu</p>
            <div className="mt-3 p-2 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 font-bold uppercase">Thời gian</p>
              <p className="text-lg font-bold text-gray-700">{formatTime(opponentTime)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Question details */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-white/50 p-8 mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📋 Chi tiết câu hỏi</h3>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {questions.map((q: any, i: number) => {
            const myAnswer = myRole === 'host'
              ? hostAnswers.find((a: any) => a.questionIndex === i)
              : guestAnswers.find((a: any) => a.questionIndex === i);
            const opAnswer = myRole === 'host'
              ? guestAnswers.find((a: any) => a.questionIndex === i)
              : hostAnswers.find((a: any) => a.questionIndex === i);

            return (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 text-sm">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${myAnswer?.correct ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                  {myAnswer?.correct ? '✓' : '✗'}
                </span>
                <span className="jp-text font-bold text-gray-800 w-8">{q.kanji}</span>
                <span className="text-gray-500 flex-1 truncate text-xs">{q.questionText}</span>
                <span className="text-xs font-bold bg-white px-2 py-1 rounded-lg jp-text text-emerald-600">{q.correctAnswer}</span>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${opAnswer?.correct ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                  {opAnswer?.correct ? '✓' : '✗'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4 flex-wrap">
        <button
          onClick={() => navigate('/battle')}
          className="px-8 py-4 bg-gradient-to-r from-sakura-500 to-sakura-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-sakura-200 transform hover:-translate-y-1 transition-all duration-200"
        >
          🔄 Đấu lại
        </button>
        <button
          onClick={() => navigate('/leaderboard')}
          className="px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl font-bold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200"
        >
          🏆 Bảng xếp hạng
        </button>
        <button
          onClick={() => navigate('/')}
          className="px-8 py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-bold hover:border-gray-300 hover:bg-gray-50 transform hover:-translate-y-1 transition-all duration-200"
        >
          🏠 Trang chủ
        </button>
      </div>
    </div>
  );
}
