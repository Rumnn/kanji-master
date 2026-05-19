import { useCallback, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, BookA, CheckCircle2, Languages, Layers, RotateCcw, XCircle } from 'lucide-react';
import ChoiceButton from '../components/ChoiceButton';
import CountdownTimer from '../components/CountdownTimer';
import ProgressBar from '../components/ProgressBar';
import { AuthContext } from '../context/AuthContext';
import vocabRaw from '../data/jlptVocabData.json?raw';

type VocabLevel = 'ALL' | 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
type PracticeMode = 'quiz' | 'flashcard';
type QuizType = 'meaning' | 'reading' | 'word';

interface VocabItem {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  level: Exclude<VocabLevel, 'ALL'>;
}

interface VocabQuestion {
  item: VocabItem;
  prompt: string;
  correctAnswer: string;
  choices: string[];
  type: QuizType;
}

const vocabData = JSON.parse(vocabRaw) as VocabItem[];

const LEVELS: Array<{ id: VocabLevel; label: string; color: string }> = [
  { id: 'ALL', label: 'Tất cả', color: 'from-gray-500 to-gray-700' },
  { id: 'N5', label: 'N5', color: 'from-blue-400 to-indigo-500' },
  { id: 'N4', label: 'N4', color: 'from-emerald-400 to-teal-500' },
  { id: 'N3', label: 'N3', color: 'from-sakura-400 to-sakura-600' },
  { id: 'N2', label: 'N2', color: 'from-amber-400 to-orange-500' },
  { id: 'N1', label: 'N1', color: 'from-rose-400 to-pink-500' },
];

const PACK_SIZES = [10, 20, 30, 50];

const TIMER_OPTIONS = [
  { label: '10s', value: 10 },
  { label: '15s', value: 15 },
  { label: '20s', value: 20 },
  { label: '30s', value: 30 },
  { label: 'Không giới hạn', value: 0 },
];

const QUIZ_TYPES: Array<{ label: string; value: QuizType | 'mixed' }> = [
  { label: 'Hỗn hợp', value: 'mixed' },
  { label: 'Nghĩa Việt', value: 'meaning' },
  { label: 'Cách đọc', value: 'reading' },
  { label: 'Chọn từ', value: 'word' },
];

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function pickChoices(correct: string, pool: string[], count = 4) {
  const distractors = shuffle(pool.filter((item) => item && item !== correct)).slice(0, count - 1);
  return shuffle([correct, ...distractors]);
}

function buildQuestion(item: VocabItem, requestedType: QuizType | 'mixed', pool: VocabItem[]): VocabQuestion {
  const availableTypes: QuizType[] = item.reading ? ['meaning', 'reading', 'word'] : ['meaning', 'word'];
  const type = requestedType === 'mixed'
    ? availableTypes[Math.floor(Math.random() * availableTypes.length)]
    : requestedType === 'reading' && !item.reading
      ? 'meaning'
      : requestedType;

  if (type === 'reading') {
    return {
      item,
      type,
      prompt: `Chọn cách đọc đúng của từ này.`,
      correctAnswer: item.reading,
      choices: pickChoices(item.reading, pool.map((entry) => entry.reading)),
    };
  }

  if (type === 'word') {
    return {
      item,
      type,
      prompt: `Từ nào có nghĩa: ${item.meaning}`,
      correctAnswer: item.word,
      choices: pickChoices(item.word, pool.map((entry) => entry.word)),
    };
  }

  return {
    item,
    type,
    prompt: `Chọn nghĩa tiếng Việt đúng.`,
    correctAnswer: item.meaning,
    choices: pickChoices(item.meaning, pool.map((entry) => entry.meaning)),
  };
}

export default function JLPTVocabPractice() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [mode, setMode] = useState<PracticeMode>('quiz');
  const [level, setLevel] = useState<VocabLevel>('N5');
  const [packSize, setPackSize] = useState(20);
  const [quizType, setQuizType] = useState<QuizType | 'mixed'>('mixed');
  const [timePerQuestion, setTimePerQuestion] = useState(15);
  const [phase, setPhase] = useState<'setup' | 'playing' | 'result'>('setup');
  const [questions, setQuestions] = useState<VocabQuestion[]>([]);
  const [flashcards, setFlashcards] = useState<VocabItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [answeredCorrectly, setAnsweredCorrectly] = useState<boolean[]>([]);
  const [timerKey, setTimerKey] = useState(0);
  const [savingResult, setSavingResult] = useState(false);

  const levelCounts = useMemo(() => (
    vocabData.reduce<Record<string, number>>((acc, item) => {
      acc[item.level] = (acc[item.level] || 0) + 1;
      acc.ALL = (acc.ALL || 0) + 1;
      return acc;
    }, {})
  ), []);

  const activePool = useMemo(
    () => (level === 'ALL' ? vocabData : vocabData.filter((item) => item.level === level)),
    [level]
  );

  const currentQuestion = questions[currentIndex];
  const currentCard = flashcards[currentIndex];

  const saveProgress = async (items: Array<{ item: VocabItem; correct: boolean }>, quizScore?: number) => {
    if (!user?.token || items.length === 0) return;

    setSavingResult(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const progressItems = items.map(({ item, correct }) => ({
        itemType: 'jlpt_vocab',
        itemKey: item.id,
        label: item.word,
        level: item.level,
        category: item.reading || item.meaning,
        correct,
      }));

      const requests = [axios.put('/api/progress/batch', { items: progressItems }, config)];

      if (typeof quizScore === 'number') {
        requests.push(axios.post('/api/history', {
          quizName: `Từ vựng JLPT ${level} - ${mode === 'quiz' ? 'Quiz' : 'Flashcard'} (${items.length} mục)`,
          score: quizScore,
          totalQuestions: items.length,
        }, config));
      }

      await Promise.all(requests);
    } catch (err) {
      console.error('Failed to save JLPT vocab progress', err);
    } finally {
      setSavingResult(false);
    }
  };

  const startPractice = () => {
    const selectedItems = shuffle(activePool).slice(0, Math.min(packSize, activePool.length));
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsRevealed(false);
    setAnsweredCorrectly([]);
    setTimerKey(0);

    if (mode === 'flashcard') {
      setFlashcards(selectedItems);
      setQuestions([]);
    } else {
      setQuestions(selectedItems.map((item) => buildQuestion(item, quizType, activePool)));
      setFlashcards([]);
    }

    setPhase('playing');
  };

  const finishQuiz = async (nextAnswers = answeredCorrectly, nextScore = score) => {
    setPhase('result');
    await saveProgress(questions.map((question, idx) => ({
      item: question.item,
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

    const nextAnswers = [...answeredCorrectly, remembered];
    const nextScore = remembered ? score + 1 : score;
    setAnsweredCorrectly(nextAnswers);
    setScore(nextScore);
    await saveProgress([{ item: currentCard, correct: remembered }]);

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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 mb-4">
            <Languages size={34} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-sakura-600 mb-3">
            Từ vựng JLPT
          </h1>
          <p className="text-gray-500 text-lg font-medium">Học bằng flashcard hoặc quiz trắc nghiệm từ file CSV mới</p>
        </div>

        <div className="space-y-7">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/50 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Layers size={20} className="text-indigo-500" /> Chế độ học
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setMode('quiz')}
                className={`p-5 rounded-2xl text-left border-2 transition-all ${mode === 'quiz' ? 'bg-indigo-50 border-indigo-300 text-indigo-800 shadow-sm' : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100'}`}
              >
                <span className="block font-black text-lg mb-1">Quiz trắc nghiệm</span>
                <span className="text-sm">Chọn nghĩa, cách đọc hoặc từ đúng trong 4 đáp án.</span>
              </button>
              <button
                onClick={() => setMode('flashcard')}
                className={`p-5 rounded-2xl text-left border-2 transition-all ${mode === 'flashcard' ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm' : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100'}`}
              >
                <span className="block font-black text-lg mb-1">Flashcard lật thẻ</span>
                <span className="text-sm">Tự nhớ nghĩa/cách đọc rồi đánh dấu đã nhớ hoặc chưa nhớ.</span>
              </button>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/50 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BookA size={20} className="text-sakura-500" /> Cấp độ JLPT
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {LEVELS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setLevel(item.id)}
                  className={`p-4 rounded-2xl font-bold text-center transition-all ${level === item.id ? `bg-gradient-to-br ${item.color} text-white shadow-lg -translate-y-1` : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                >
                  {item.label}
                  <span className="block text-xs opacity-80 mt-1">{levelCounts[item.id] || 0} từ</span>
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
              <div className="grid grid-cols-4 gap-3">
                {PACK_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setPackSize(size)}
                    className={`p-3 rounded-xl font-bold transition-all ${packSize === size ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-300' : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'}`}
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
              className="px-12 py-4 bg-gradient-to-r from-indigo-500 to-sakura-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:shadow-indigo-200 transform hover:-translate-y-1 transition-all"
            >
              Bắt đầu
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'playing' && mode === 'flashcard' && currentCard) {
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
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest">{currentCard.level}</span>
            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-black uppercase tracking-widest">Từ vựng</span>
          </div>

          <h2 className="text-5xl sm:text-6xl font-black text-gray-800 jp-text mb-4">{currentCard.word}</h2>
          {!isRevealed && currentCard.reading && (
            <p className="text-gray-400 font-bold jp-text mb-8">{currentCard.reading}</p>
          )}

          {isRevealed ? (
            <div className="text-left space-y-5 animate-fade-in">
              {currentCard.reading && (
                <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-5">
                  <p className="text-sm font-black text-indigo-700 uppercase tracking-widest mb-2">Cách đọc</p>
                  <p className="text-gray-800 font-bold jp-text text-2xl">{currentCard.reading}</p>
                </div>
              )}
              <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-5">
                <p className="text-sm font-black text-emerald-700 uppercase tracking-widest mb-2">Nghĩa tiếng Việt</p>
                <p className="text-gray-700 font-semibold">{currentCard.meaning}</p>
              </div>
            </div>
          ) : (
            <div className="min-h-52 flex flex-col items-center justify-center">
              <p className="text-gray-500 mb-6">Tự nhớ nghĩa và cách đọc trước khi lật thẻ.</p>
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
            <p className="text-2xl font-black text-indigo-500">{score}</p>
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
              <div className="inline-flex px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest mb-5">
                {currentQuestion.item.level} • {currentQuestion.type}
              </div>
              {currentQuestion.type !== 'word' && (
                <div className="text-6xl sm:text-7xl font-black text-gray-800 jp-text mb-4">
                  {currentQuestion.item.word}
                </div>
              )}
              <p className="text-xl text-gray-700 font-bold leading-relaxed">{currentQuestion.prompt}</p>
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
                isJapanese={currentQuestion.type === 'reading' || currentQuestion.type === 'word'}
              />
            ))}
          </div>

          {isRevealed && (
            <div className="mt-6 p-5 bg-indigo-50 rounded-2xl border border-indigo-200 text-left w-full">
              <p className="text-indigo-800 font-black mb-2">
                {currentQuestion.item.word}
                {currentQuestion.item.reading ? <span className="jp-text text-gray-500"> ・ {currentQuestion.item.reading}</span> : null}
              </p>
              <p className="text-gray-700 text-sm">{currentQuestion.item.meaning}</p>
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
        <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-6">
          <CheckCircle2 size={42} />
        </div>
        <h2 className="text-4xl font-extrabold text-gray-800 mb-2">Hoàn thành</h2>
        <p className="text-gray-500 font-medium mb-8">Từ vựng JLPT {level} • {mode === 'quiz' ? 'Quiz' : 'Flashcard'} • {totalItems} mục</p>

        <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-sakura-600 mb-2">
          {score} <span className="text-4xl text-gray-400">/ {totalItems}</span>
        </div>
        <p className="text-xl text-gray-500 font-medium mb-10">
          Tỉ lệ nhớ đúng: <span className="text-indigo-600 font-bold">{percentage}%</span>
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => setPhase('setup')}
            className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-sakura-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-200 transform hover:-translate-y-1 transition-all"
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
