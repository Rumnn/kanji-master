import { useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ChoiceButton from '../components/ChoiceButton';
import CountdownTimer from '../components/CountdownTimer';
import ProgressBar from '../components/ProgressBar';
import { AuthContext } from '../context/AuthContext';

interface Question {
  kanji: string;
  questionText: string;
  type: string;
  correctAnswer: string;
  choices: string[];
}

const TIMER_OPTIONS = [
  { label: '5s', value: 5 },
  { label: '10s', value: 10 },
  { label: '15s', value: 15 },
  { label: '20s', value: 20 },
  { label: '30s', value: 30 },
  { label: 'Không giới hạn', value: 0 },
];

const QUESTION_TYPES = [
  { label: '🔀 Hỗn hợp', value: 'mixed' },
  { label: '📖 Cách đọc', value: 'reading' },
  { label: '💡 Nghĩa Việt', value: 'meaning' },
  { label: '🈶 Chọn Kanji', value: 'kanji' },
];

const LEVELS = [
  { id: 'N5', label: 'N5 - 初級', color: 'from-blue-400 to-indigo-500' },
  { id: 'N4', label: 'N4 - 中級', color: 'from-emerald-400 to-teal-500' },
  { id: 'N3', label: 'N3 - 上級', color: 'from-sakura-400 to-sakura-600' },
];

const PACK_SIZES = [5, 10, 15, 20];

export default function MultipleChoiceQuiz() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Setup state
  const [phase, setPhase] = useState<'setup' | 'playing' | 'result'>('setup');
  const [level, setLevel] = useState('N5');
  const [packSize, setPackSize] = useState(10);
  const [questionType, setQuestionType] = useState('mixed');
  const [timePerQuestion, setTimePerQuestion] = useState(10);

  // Game state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timerKey, setTimerKey] = useState(0);
  const [answeredCorrectly, setAnsweredCorrectly] = useState<boolean[]>([]);
  const [savingResult, setSavingResult] = useState(false);

  const currentQuestion = questions[currentIndex];

  const startQuiz = async () => {
    setLoading(true);
    setError('');
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const { data } = await axios.get(
        `/api/battle/quiz/generate?level=${level}&count=${packSize}&type=${questionType}`,
        config
      );
      setQuestions(data.questions);
      setCurrentIndex(0);
      setScore(0);
      setSelectedAnswer(null);
      setIsRevealed(false);
      setAnsweredCorrectly([]);
      setTimerKey(0);
      setPhase('playing');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải câu hỏi từ server.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = useCallback((answer: string) => {
    if (isRevealed) return;
    setSelectedAnswer(answer);
    setIsRevealed(true);

    const correct = answer === currentQuestion.correctAnswer;
    if (correct) setScore((s) => s + 1);
    setAnsweredCorrectly((prev) => [...prev, correct]);

    // Auto next after 1.5s
    setTimeout(() => {
      goNext();
    }, 1500);
  }, [isRevealed, currentQuestion, currentIndex, questions.length]);

  const handleTimeout = useCallback(() => {
    if (isRevealed) return;
    setSelectedAnswer(null);
    setIsRevealed(true);
    setAnsweredCorrectly((prev) => [...prev, false]);

    setTimeout(() => {
      goNext();
    }, 1500);
  }, [isRevealed, currentIndex, questions.length]);

  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setIsRevealed(false);
      setTimerKey((k) => k + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    const statsPayload = questions.map((q, idx) => ({
      kanji: q.kanji,
      correct: answeredCorrectly[idx]
    }));

    setPhase('result');
    if (user?.token) {
      setSavingResult(true);
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        // Save History
        await axios.post('/api/history', {
          quizName: `Trắc nghiệm ${level} - ${questionType} (${questions.length} câu)`,
          score,
          totalQuestions: questions.length
        }, config);

        // Update Kanji Stats
        await axios.put('/api/kanji/stats', { stats: statsPayload }, config);

      } catch (err) {
        console.error('Failed to save history or stats', err);
      } finally {
        setSavingResult(false);
      }
    }
  };

  const getChoiceState = (choice: string): 'default' | 'selected' | 'correct' | 'wrong' | 'disabled' => {
    if (!isRevealed) return 'default';
    if (choice === currentQuestion.correctAnswer) return 'correct';
    if (choice === selectedAnswer && choice !== currentQuestion.correctAnswer) return 'wrong';
    return 'disabled';
  };

  // SETUP PHASE
  if (phase === 'setup') {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in-up">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sakura-500 to-sakura-600 mb-3">
            📝 Trắc Nghiệm Kanji
          </h1>
          <p className="text-gray-500 text-lg font-medium">Tùy chỉnh bài kiểm tra của bạn</p>
        </div>

        <div className="space-y-8">
          {/* Level */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="p-2 bg-blue-50 rounded-xl">🎌</span> Chọn cấp độ JLPT
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {LEVELS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLevel(l.id)}
                  className={`p-4 rounded-2xl font-bold text-center transition-all duration-200 ${
                    level === l.id
                      ? `bg-gradient-to-br ${l.color} text-white shadow-lg -translate-y-1`
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question Type */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="p-2 bg-amber-50 rounded-xl">📋</span> Loại câu hỏi
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {QUESTION_TYPES.map((qt) => (
                <button
                  key={qt.value}
                  onClick={() => setQuestionType(qt.value)}
                  className={`p-4 rounded-2xl font-bold text-sm transition-all duration-200 ${
                    questionType === qt.value
                      ? 'bg-sakura-50 text-sakura-700 border-2 border-sakura-300 shadow-sm'
                      : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  {qt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pack size */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="p-2 bg-emerald-50 rounded-xl">📊</span> Số lượng câu hỏi
            </h3>
            <div className="flex gap-3">
              {PACK_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setPackSize(size)}
                  className={`flex-1 p-3 rounded-xl font-bold transition-all duration-200 ${
                    packSize === size
                      ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-300'
                      : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  {size} câu
                </button>
              ))}
            </div>
          </div>

          {/* Timer */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="p-2 bg-rose-50 rounded-xl">⏱️</span> Thời gian mỗi câu
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {TIMER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTimePerQuestion(opt.value)}
                  className={`p-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                    timePerQuestion === opt.value
                      ? 'bg-rose-50 text-rose-700 border-2 border-rose-300'
                      : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-center text-rose-500 font-bold bg-rose-50 rounded-2xl p-4">{error}</div>
          )}

          {/* Start button */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="px-8 py-4 bg-white text-gray-600 rounded-2xl font-bold border-2 border-gray-200 hover:bg-gray-50 transition-all"
            >
              ← Quay lại
            </button>
            <button
              onClick={startQuiz}
              disabled={loading}
              className="px-12 py-4 bg-gradient-to-r from-sakura-500 to-sakura-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:shadow-sakura-200 transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-60"
            >
              {loading ? 'Đang tải...' : '🚀 Bắt đầu!'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PLAYING PHASE
  if (phase === 'playing' && currentQuestion) {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in-up">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => { if (confirm('Bạn có chắc muốn thoát?')) navigate('/'); }} className="text-gray-500 hover:text-gray-800 font-medium px-4 py-2 hover:bg-white/80 rounded-lg transition-colors">
              ← Thoát
            </button>
            <div className="hidden sm:block h-8 w-px bg-gray-300" />
            <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600">
              Trắc nghiệm {level}
            </h1>
          </div>
          <div className="flex items-center gap-4 px-5 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Điểm</p>
            <p className="text-2xl font-black text-sakura-500">{score}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <ProgressBar current={currentIndex + 1} total={questions.length} />
        </div>

        {/* Question card */}
        <div className="flex flex-col items-center">
          {/* Timer + Question */}
          <div className="flex items-start gap-6 w-full mb-8">
            {timePerQuestion > 0 && (
              <div className="shrink-0">
                <CountdownTimer
                  key={timerKey}
                  duration={timePerQuestion}
                  onTimeout={handleTimeout}
                  isPaused={isRevealed}
                />
              </div>
            )}
            <div className="flex-1 bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-white text-center">
              {currentQuestion.type === 'kanji' ? (
                <>
                  <p className="text-lg text-gray-500 mb-4 font-medium">{currentQuestion.questionText}</p>
                </>
              ) : (
                <>
                  <div className="text-8xl font-black text-gray-800 jp-text mb-4 drop-shadow-md">
                    {currentQuestion.kanji}
                  </div>
                  <p className="text-lg text-gray-500 font-medium">{currentQuestion.questionText}</p>
                </>
              )}
            </div>
          </div>

          {/* Choices */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentQuestion.choices.map((choice, idx) => (
              <ChoiceButton
                key={`${currentIndex}-${idx}`}
                label={choice}
                index={idx}
                onClick={() => handleAnswer(choice)}
                state={getChoiceState(choice)}
                isJapanese={currentQuestion.type === 'kanji' || currentQuestion.type === 'reading'}
              />
            ))}
          </div>

          {/* Revealed: show correct answer note */}
          {isRevealed && selectedAnswer === null && (
            <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-200 text-center">
              <p className="text-amber-700 font-bold">⏰ Hết giờ! Đáp án đúng: <span className="text-amber-900 jp-text">{currentQuestion.correctAnswer}</span></p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // RESULT PHASE
  if (phase === 'result') {
    const percentage = Math.round((score / questions.length) * 100);
    let emoji = '😢';
    let message = 'Cần cố gắng hơn!';
    if (percentage >= 90) { emoji = '🏆'; message = 'Xuất sắc!'; }
    else if (percentage >= 70) { emoji = '🎉'; message = 'Tốt lắm!'; }
    else if (percentage >= 50) { emoji = '👍'; message = 'Khá tốt!'; }

    return (
      <div className="max-w-2xl mx-auto animate-fade-in-up">
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl p-12 text-center border border-white/40">
          <div className="text-7xl mb-4">{emoji}</div>
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-gray-800 to-gray-600 mb-2">
            {message}
          </h2>
          <p className="text-gray-500 font-medium mb-8">Trắc nghiệm {level} • {questions.length} câu • {questionType}</p>

          <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-sakura-500 to-sakura-600 mb-2">
            {score} <span className="text-4xl text-gray-400">/ {questions.length}</span>
          </div>
          <p className="text-xl text-gray-500 font-medium mb-10">
            Tỉ lệ đúng: <span className="text-sakura-600 font-bold">{percentage}%</span>
          </p>

          <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div className="text-4xl font-black text-emerald-500 mb-2">{score}</div>
              <p className="text-emerald-700 font-semibold text-sm uppercase tracking-wide">Đúng</p>
            </div>
            <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100">
              <div className="text-4xl font-black text-rose-500 mb-2">{questions.length - score}</div>
              <p className="text-rose-700 font-semibold text-sm uppercase tracking-wide">Sai</p>
            </div>
          </div>

          {/* Question review */}
          <div className="mb-10">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Chi tiết câu hỏi</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto text-left">
              {questions.map((q, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl text-sm ${answeredCorrectly[i] ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${answeredCorrectly[i] ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                    {answeredCorrectly[i] ? '✓' : '✗'}
                  </span>
                  <span className="jp-text font-bold text-gray-800">{q.kanji}</span>
                  <span className="text-gray-500 flex-1 truncate">{q.questionText}</span>
                  <span className="text-xs font-bold text-gray-600 bg-white px-2 py-1 rounded-lg jp-text">{q.correctAnswer}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => { setPhase('setup'); setScore(0); setCurrentIndex(0); }}
              className="px-8 py-4 bg-gradient-to-r from-sakura-500 to-sakura-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-sakura-200 transform hover:-translate-y-1 transition-all duration-200"
            >
              🔄 Chơi lại
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
          {savingResult && <p className="text-gray-400 text-sm mt-4">Đang lưu kết quả...</p>}
        </div>
      </div>
    );
  }

  return null;
}
