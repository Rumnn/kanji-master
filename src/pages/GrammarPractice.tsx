import { useCallback, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, BookOpen, CheckCircle2, Layers, RotateCcw, Sparkles, XCircle } from 'lucide-react';
import ChoiceButton from '../components/ChoiceButton';
import CountdownTimer from '../components/CountdownTimer';
import ProgressBar from '../components/ProgressBar';
import { AuthContext } from '../context/AuthContext';
import grammarN5Raw from '../data/grammar_ja_N5_full_alphabetical_0001.json?raw';
import grammarN4Raw from '../data/grammar_ja_N4_full_alphabetical_0001.json?raw';
import grammarN3Raw from '../data/grammar_ja_N3_full_alphabetical_0001.json?raw';

interface GrammarExample {
  jp: string;
  romaji: string;
  vn: string;
}

interface GrammarPoint {
  title: string;
  short_explanation: string;
  long_explanation: string;
  formation: string;
  examples: GrammarExample[];
  level: GrammarLevel;
}

interface GrammarQuestion {
  point: GrammarPoint;
  prompt: string;
  correctAnswer: string;
  choices: string[];
  type: QuizType;
}

type GrammarLevel = 'N5' | 'N4' | 'N3';
type PracticeMode = 'quiz' | 'flashcard';
type QuizType = 'meaning' | 'formation' | 'example';

const grammarData: Record<GrammarLevel, GrammarPoint[]> = {
  N5: JSON.parse(grammarN5Raw).map((point: Omit<GrammarPoint, 'level'>) => ({ ...point, level: 'N5' })),
  N4: JSON.parse(grammarN4Raw).map((point: Omit<GrammarPoint, 'level'>) => ({ ...point, level: 'N4' })),
  N3: JSON.parse(grammarN3Raw).map((point: Omit<GrammarPoint, 'level'>) => ({ ...point, level: 'N3' })),
};

const LEVELS: Array<{ id: GrammarLevel; label: string; color: string }> = [
  { id: 'N5', label: 'N5 - Cơ bản', color: 'from-blue-400 to-indigo-500' },
  { id: 'N4', label: 'N4 - Sơ trung cấp', color: 'from-emerald-400 to-teal-500' },
  { id: 'N3', label: 'N3 - Trung cấp', color: 'from-sakura-400 to-sakura-600' },
];

const PACK_SIZES = [5, 10, 15, 20];

const TIMER_OPTIONS = [
  { label: '10s', value: 10 },
  { label: '15s', value: 15 },
  { label: '20s', value: 20 },
  { label: '30s', value: 30 },
  { label: 'Không giới hạn', value: 0 },
];

const QUIZ_TYPES: Array<{ label: string; value: QuizType | 'mixed' }> = [
  { label: 'Hỗn hợp', value: 'mixed' },
  { label: 'Nghĩa', value: 'meaning' },
  { label: 'Cách dùng', value: 'formation' },
  { label: 'Ví dụ', value: 'example' },
];

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function pickChoices(correct: string, pool: string[], count = 4) {
  const distractors = shuffle(pool.filter((item) => item && item !== correct)).slice(0, count - 1);
  return shuffle([correct, ...distractors]);
}

function buildQuestion(point: GrammarPoint, type: QuizType, allPoints: GrammarPoint[]): GrammarQuestion {
  if (type === 'formation') {
    return {
      point,
      type,
      prompt: `Cấu trúc nào phù hợp với mẫu "${point.title}"?`,
      correctAnswer: point.formation,
      choices: pickChoices(point.formation, allPoints.map((item) => item.formation)),
    };
  }

  if (type === 'example') {
    const example = point.examples[0];
    return {
      point,
      type,
      prompt: example ? `Câu ví dụ này dùng mẫu ngữ pháp nào?\n${example.jp}` : `Mẫu ngữ pháp nào có nghĩa: ${point.short_explanation}`,
      correctAnswer: point.title,
      choices: pickChoices(point.title, allPoints.map((item) => item.title)),
    };
  }

  return {
    point,
    type,
    prompt: `Mẫu "${point.title}" có nghĩa gần nhất là gì?`,
    correctAnswer: point.short_explanation,
    choices: pickChoices(point.short_explanation, allPoints.map((item) => item.short_explanation)),
  };
}

export default function GrammarPractice() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [mode, setMode] = useState<PracticeMode>('quiz');
  const [level, setLevel] = useState<GrammarLevel>('N5');
  const [packSize, setPackSize] = useState(10);
  const [quizType, setQuizType] = useState<QuizType | 'mixed'>('mixed');
  const [timePerQuestion, setTimePerQuestion] = useState(15);
  const [phase, setPhase] = useState<'setup' | 'playing' | 'result'>('setup');
  const [questions, setQuestions] = useState<GrammarQuestion[]>([]);
  const [flashcards, setFlashcards] = useState<GrammarPoint[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [answeredCorrectly, setAnsweredCorrectly] = useState<boolean[]>([]);
  const [timerKey, setTimerKey] = useState(0);
  const [savingResult, setSavingResult] = useState(false);

  const allGrammar = useMemo(() => Object.values(grammarData).flat(), []);
  const currentQuestion = questions[currentIndex];
  const currentCard = flashcards[currentIndex];

  const startPractice = () => {
    const points = shuffle(grammarData[level]).slice(0, packSize);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsRevealed(false);
    setAnsweredCorrectly([]);
    setTimerKey(0);

    if (mode === 'flashcard') {
      setFlashcards(points);
      setQuestions([]);
    } else {
      const quizTypes: QuizType[] = ['meaning', 'formation', 'example'];
      setQuestions(points.map((point) => buildQuestion(
        point,
        quizType === 'mixed' ? quizTypes[Math.floor(Math.random() * quizTypes.length)] : quizType,
        allGrammar
      )));
      setFlashcards([]);
    }

    setPhase('playing');
  };

  const saveProgress = async (items: Array<{ point: GrammarPoint; correct: boolean }>, quizScore?: number) => {
    if (!user?.token || items.length === 0) return;

    setSavingResult(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const progressItems = items.map(({ point, correct }) => ({
        itemType: 'grammar',
        itemKey: `${point.level}:${point.title}`,
        label: point.title,
        level: point.level,
        category: 'Japanese Grammar',
        correct,
      }));

      const requests = [axios.put('/api/progress/batch', { items: progressItems }, config)];

      if (typeof quizScore === 'number') {
        requests.push(axios.post('/api/history', {
          quizName: `Ngữ pháp ${level} - ${mode === 'quiz' ? 'Quiz' : 'Flashcard'} (${items.length} câu)`,
          score: quizScore,
          totalQuestions: items.length,
        }, config));
      }

      await Promise.all(requests);
    } catch (err) {
      console.error('Failed to save grammar progress', err);
    } finally {
      setSavingResult(false);
    }
  };

  const finishQuiz = async (nextAnswers = answeredCorrectly, nextScore = score) => {
    setPhase('result');
    await saveProgress(questions.map((question, idx) => ({
      point: question.point,
      correct: Boolean(nextAnswers[idx]),
    })), nextScore);
  };

  const goNextQuestion = (nextAnswers = answeredCorrectly, nextScore = score) => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((idx) => idx + 1);
      setSelectedAnswer(null);
      setIsRevealed(false);
      setTimerKey((key) => key + 1);
    } else {
      finishQuiz(nextAnswers, nextScore);
    }
  };

  const handleAnswer = useCallback((answer: string) => {
    if (!currentQuestion || isRevealed) return;

    const correct = answer === currentQuestion.correctAnswer;
    const nextAnswers = [...answeredCorrectly, correct];
    const nextScore = correct ? score + 1 : score;

    setSelectedAnswer(answer);
    setIsRevealed(true);
    setAnsweredCorrectly(nextAnswers);
    setScore(nextScore);

    setTimeout(() => goNextQuestion(nextAnswers, nextScore), 1600);
  }, [answeredCorrectly, currentQuestion, isRevealed, score]);

  const handleTimeout = useCallback(() => {
    if (!currentQuestion || isRevealed) return;
    const nextAnswers = [...answeredCorrectly, false];

    setSelectedAnswer(null);
    setIsRevealed(true);
    setAnsweredCorrectly(nextAnswers);

    setTimeout(() => goNextQuestion(nextAnswers, score), 1600);
  }, [answeredCorrectly, currentQuestion, isRevealed, score]);

  const handleFlashcardResult = async (remembered: boolean) => {
    if (!currentCard) return;

    if (remembered) setScore((value) => value + 1);
    setAnsweredCorrectly((prev) => [...prev, remembered]);
    await saveProgress([{ point: currentCard, correct: remembered }]);

    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex((idx) => idx + 1);
      setIsRevealed(false);
    } else {
      setPhase('result');
    }
  };

  const getChoiceState = (choice: string): 'default' | 'selected' | 'correct' | 'wrong' | 'disabled' => {
    if (!isRevealed || !currentQuestion) return 'default';
    if (choice === currentQuestion.correctAnswer) return 'correct';
    if (choice === selectedAnswer && choice !== currentQuestion.correctAnswer) return 'wrong';
    return 'disabled';
  };

  if (phase === 'setup') {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in-up">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 mb-4">
            <BookOpen size={34} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-sakura-600 mb-3">
            Ôn tập Ngữ pháp Nhật
          </h1>
          <p className="text-gray-500 text-lg font-medium">Quiz nhanh và flashcard riêng cho bộ ngữ pháp N5, N4, N3</p>
        </div>

        <div className="space-y-7">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/50 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Layers size={20} className="text-amber-500" /> Chế độ học
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setMode('quiz')}
                className={`p-5 rounded-2xl text-left border-2 transition-all ${mode === 'quiz' ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-sm' : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100'}`}
              >
                <span className="block font-black text-lg mb-1">Quiz trắc nghiệm</span>
                <span className="text-sm">Chọn nghĩa, cấu trúc hoặc mẫu đúng từ 4 đáp án.</span>
              </button>
              <button
                onClick={() => setMode('flashcard')}
                className={`p-5 rounded-2xl text-left border-2 transition-all ${mode === 'flashcard' ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm' : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100'}`}
              >
                <span className="block font-black text-lg mb-1">Flashcard lật thẻ</span>
                <span className="text-sm">Xem mẫu, tự nhớ nghĩa rồi đánh dấu đã nhớ/chưa nhớ.</span>
              </button>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/50 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Sparkles size={20} className="text-blue-500" /> Cấp độ JLPT
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {LEVELS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setLevel(item.id)}
                  className={`p-4 rounded-2xl font-bold text-center transition-all ${level === item.id ? `bg-gradient-to-br ${item.color} text-white shadow-lg -translate-y-1` : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                >
                  {item.label}
                  <span className="block text-xs opacity-80 mt-1">{grammarData[item.id].length} mẫu</span>
                </button>
              ))}
            </div>
          </div>

          {mode === 'quiz' && (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/50 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Loại câu hỏi</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {QUIZ_TYPES.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setQuizType(item.value)}
                    className={`p-3 rounded-xl font-bold transition-all ${quizType === item.value ? 'bg-sakura-50 text-sakura-700 border-2 border-sakura-300' : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/50 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Số lượng</h3>
              <div className="flex gap-3">
                {PACK_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setPackSize(size)}
                    className={`flex-1 p-3 rounded-xl font-bold transition-all ${packSize === size ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-300' : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {mode === 'quiz' && (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/50 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Thời gian mỗi câu</h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {TIMER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTimePerQuestion(option.value)}
                      className={`p-3 rounded-xl font-bold text-sm transition-all ${timePerQuestion === option.value ? 'bg-rose-50 text-rose-700 border-2 border-rose-300' : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-600 rounded-2xl font-bold border-2 border-gray-200 hover:bg-gray-50 transition-all"
            >
              <ArrowLeft size={18} /> Quay lại
            </button>
            <button
              onClick={startPractice}
              className="px-12 py-4 bg-gradient-to-r from-amber-500 to-sakura-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:shadow-amber-200 transform hover:-translate-y-1 transition-all"
            >
              Bắt đầu
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'playing' && mode === 'flashcard' && currentCard) {
    const example = currentCard.examples[0];

    return (
      <div className="max-w-3xl mx-auto animate-fade-in-up">
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={() => setPhase('setup')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 text-gray-600 font-bold border border-white hover:bg-white transition-colors"
          >
            <ArrowLeft size={18} /> Thoát
          </button>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Flashcard {level}</p>
            <p className="text-xl font-black text-gray-800">{currentIndex + 1}/{flashcards.length}</p>
          </div>
        </div>

        <ProgressBar current={currentIndex + 1} total={flashcards.length} />

        <div className="mt-8 bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-xl p-8 sm:p-10 border border-white text-center">
          <div className="flex justify-center gap-2 mb-6">
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-black uppercase tracking-widest">{currentCard.level}</span>
            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-black uppercase tracking-widest">Ngữ pháp</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-black text-gray-800 jp-text mb-6">{currentCard.title}</h2>

          {isRevealed ? (
            <div className="text-left space-y-5 animate-fade-in">
              <div className="rounded-2xl bg-amber-50 border border-amber-100 p-5">
                <p className="text-sm font-black text-amber-700 uppercase tracking-widest mb-2">Nghĩa</p>
                <p className="text-gray-700 font-semibold">{currentCard.short_explanation}</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-5">
                <p className="text-sm font-black text-emerald-700 uppercase tracking-widest mb-2">Cấu trúc</p>
                <p className="text-gray-800 font-bold jp-text">{currentCard.formation}</p>
              </div>
              {example && (
                <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
                  <p className="text-sm font-black text-gray-500 uppercase tracking-widest mb-2">Ví dụ</p>
                  <p className="text-gray-800 jp-text font-bold mb-2">{example.jp}</p>
                  <p className="text-gray-500 text-sm mb-2">{example.romaji}</p>
                  <p className="text-gray-700">{example.vn}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="min-h-64 flex flex-col items-center justify-center">
              <p className="text-gray-500 mb-6">Tự nhớ nghĩa, cách dùng và ví dụ trước khi lật thẻ.</p>
              <button
                onClick={() => setIsRevealed(true)}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
              >
                <RotateCcw size={18} /> Lật thẻ
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            <button
              onClick={() => handleFlashcardResult(false)}
              disabled={!isRevealed || savingResult}
              className="inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 font-black hover:bg-rose-100 transition-colors disabled:opacity-50"
            >
              <XCircle size={22} /> Chưa nhớ
            </button>
            <button
              onClick={() => handleFlashcardResult(true)}
              disabled={!isRevealed || savingResult}
              className="inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 font-black hover:bg-emerald-100 transition-colors disabled:opacity-50"
            >
              <CheckCircle2 size={22} /> Đã nhớ
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'playing' && mode === 'quiz' && currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto animate-fade-in-up">
        <div className="flex justify-between items-center mb-6 bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-sm">
          <button onClick={() => setPhase('setup')} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 font-medium px-4 py-2 hover:bg-white/80 rounded-lg transition-colors">
            <ArrowLeft size={18} /> Thoát
          </button>
          <div className="flex items-center gap-4 px-5 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Điểm</p>
            <p className="text-2xl font-black text-amber-500">{score}</p>
          </div>
        </div>

        <div className="mb-8">
          <ProgressBar current={currentIndex + 1} total={questions.length} />
        </div>

        <div className="flex flex-col items-center">
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
              <div className="inline-flex px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-black uppercase tracking-widest mb-5">
                {currentQuestion.point.level} • {currentQuestion.type}
              </div>
              <p className="text-xl text-gray-700 font-bold whitespace-pre-line leading-relaxed">{currentQuestion.prompt}</p>
            </div>
          </div>

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentQuestion.choices.map((choice, idx) => (
              <ChoiceButton
                key={`${currentIndex}-${idx}`}
                label={choice}
                index={idx}
                onClick={() => handleAnswer(choice)}
                state={getChoiceState(choice)}
                isJapanese={currentQuestion.type === 'example'}
              />
            ))}
          </div>

          {isRevealed && (
            <div className="mt-6 p-5 bg-amber-50 rounded-2xl border border-amber-200 text-left w-full">
              <p className="text-amber-800 font-black mb-2">Mẫu: <span className="jp-text">{currentQuestion.point.title}</span></p>
              <p className="text-gray-700 text-sm">{currentQuestion.point.short_explanation}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const totalItems = mode === 'quiz' ? questions.length : flashcards.length;
  const percentage = totalItems ? Math.round((score / totalItems) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl p-10 sm:p-12 text-center border border-white/40">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center mb-6">
          <CheckCircle2 size={42} />
        </div>
        <h2 className="text-4xl font-extrabold text-gray-800 mb-2">Hoàn thành</h2>
        <p className="text-gray-500 font-medium mb-8">Ngữ pháp {level} • {mode === 'quiz' ? 'Quiz' : 'Flashcard'} • {totalItems} mục</p>

        <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-500 to-sakura-600 mb-2">
          {score} <span className="text-4xl text-gray-400">/ {totalItems}</span>
        </div>
        <p className="text-xl text-gray-500 font-medium mb-10">
          Tỉ lệ nhớ đúng: <span className="text-amber-600 font-bold">{percentage}%</span>
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => setPhase('setup')}
            className="px-8 py-4 bg-gradient-to-r from-amber-500 to-sakura-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-amber-200 transform hover:-translate-y-1 transition-all"
          >
            Chơi lại
          </button>
          <button
            onClick={() => navigate('/review')}
            className="px-8 py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-bold hover:border-gray-300 hover:bg-gray-50 transform hover:-translate-y-1 transition-all"
          >
            Ôn tập hôm nay
          </button>
        </div>
        {savingResult && <p className="text-gray-400 text-sm mt-4">Đang lưu kết quả...</p>}
      </div>
    </div>
  );
}
