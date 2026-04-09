import { useState, useEffect, useContext, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SocketContext } from '../context/SocketContext';
import ChoiceButton from '../components/ChoiceButton';
import CountdownTimer from '../components/CountdownTimer';
import BattleHeader from '../components/BattleHeader';
import ProgressBar from '../components/ProgressBar';

interface Question {
  kanji: string;
  questionText: string;
  type: string;
  choices: string[];
}

interface LocationState {
  questions: Question[];
  timePerQuestion: number;
  questionCount: number;
  role: 'host' | 'guest';
  roomCode: string;
  hostName: string;
  guestName: string;
}

export default function BattlePlay() {
  const location = useLocation();
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);

  const state = location.state as LocationState;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [finished, setFinished] = useState(false);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [opponentFinished, setOpponentFinished] = useState(false);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);

  // Opponent tracking
  const [hostScore, setHostScore] = useState(0);
  const [guestScore, setGuestScore] = useState(0);
  const [hostProgress, setHostProgress] = useState(0);
  const [guestProgress, setGuestProgress] = useState(0);

  // Game result
  const [gameResult, setGameResult] = useState<any>(null);

  // Redirect if no state
  useEffect(() => {
    if (!state || !state.questions) {
      navigate('/battle');
    }
    setQuestionStartTime(Date.now());
  }, []);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('game:progress', (data: any) => {
      if (data.role === 'host') {
        setHostScore(data.hostScore);
        setHostProgress((prev) => Math.max(prev, data.questionIndex + 1));
      } else {
        setGuestScore(data.guestScore);
        setGuestProgress((prev) => Math.max(prev, data.questionIndex + 1));
      }
      // Also update the other scores
      setHostScore(data.hostScore);
      setGuestScore(data.guestScore);
    });

    socket.on('game:playerFinished', (data: any) => {
      if (data.role !== state?.role) {
        setOpponentFinished(true);
      }
    });

    socket.on('game:playerDisconnected', (data: any) => {
      if (data.role !== state?.role) {
        setOpponentDisconnected(true);
      }
    });

    socket.on('game:result', (data: any) => {
      setGameResult(data);
      // Navigate to result page
      navigate(`/battle/${state?.roomCode}/result`, {
        state: {
          ...data,
          myRole: state?.role
        }
      });
    });

    return () => {
      socket.off('game:progress');
      socket.off('game:playerFinished');
      socket.off('game:playerDisconnected');
      socket.off('game:result');
    };
  }, [socket, state, navigate]);

  if (!state || !state.questions) return null;

  const currentQuestion = state.questions[currentIndex];

  const handleAnswer = useCallback((answer: string) => {
    if (isRevealed || finished) return;

    const timeMs = Date.now() - questionStartTime;
    setSelectedAnswer(answer);
    setIsRevealed(true);

    // We don't know the correct answer in battle mode—server determines it
    // Just send the answer
    socket?.emit('game:answer', {
      roomCode: state.roomCode,
      questionIndex: currentIndex,
      answer,
      timeMs,
      role: state.role
    });

    // Update own progress
    if (state.role === 'host') {
      setHostProgress(currentIndex + 1);
    } else {
      setGuestProgress(currentIndex + 1);
    }

    // Auto next
    setTimeout(() => goNext(), 1000);
  }, [isRevealed, finished, currentIndex, questionStartTime, state, socket]);

  const handleTimeout = useCallback(() => {
    if (isRevealed || finished) return;

    const timeMs = state.timePerQuestion * 1000;
    setIsRevealed(true);

    socket?.emit('game:answer', {
      roomCode: state.roomCode,
      questionIndex: currentIndex,
      answer: '',
      timeMs,
      role: state.role
    });

    if (state.role === 'host') {
      setHostProgress(currentIndex + 1);
    } else {
      setGuestProgress(currentIndex + 1);
    }

    setTimeout(() => goNext(), 1000);
  }, [isRevealed, finished, currentIndex, state, socket]);

  const goNext = () => {
    if (currentIndex < state.questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setIsRevealed(false);
      setTimerKey((k) => k + 1);
      setQuestionStartTime(Date.now());
    } else {
      setFinished(true);
      setWaitingForOpponent(true);
      socket?.emit('game:finished', {
        roomCode: state.roomCode,
        role: state.role
      });
    }
  };

  // WAITING FOR OPPONENT TO FINISH
  if (waitingForOpponent && !gameResult) {
    return (
      <div className="max-w-xl mx-auto animate-fade-in-up text-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl p-12 border border-white/40">
          {opponentDisconnected ? (
            <>
              <div className="text-6xl mb-4">😢</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Đối thủ đã ngắt kết nối</h2>
              <p className="text-gray-500 mb-6">Chờ 30 giây để tự động xác nhận chiến thắng...</p>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-sakura-200 border-t-sakura-500 mx-auto" />
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">⏳</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Đã hoàn thành!</h2>
              <p className="text-gray-500 mb-6">Đang chờ đối thủ hoàn thành bài thi...</p>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-sakura-200 border-t-sakura-500 mx-auto" />
            </>
          )}
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      {/* Battle Header */}
      <div className="mb-6">
        <BattleHeader
          hostName={state.hostName}
          guestName={state.guestName}
          hostScore={hostScore}
          guestScore={guestScore}
          hostProgress={hostProgress}
          guestProgress={guestProgress}
          totalQuestions={state.questionCount}
        />
      </div>

      {/* Progress */}
      <div className="mb-6">
        <ProgressBar current={currentIndex + 1} total={state.questions.length} />
      </div>

      {/* Question + Timer */}
      <div className="flex items-start gap-6 w-full mb-8">
        {state.timePerQuestion > 0 && (
          <div className="shrink-0">
            <CountdownTimer
              key={timerKey}
              duration={state.timePerQuestion}
              onTimeout={handleTimeout}
              isPaused={isRevealed}
            />
          </div>
        )}
        <div className="flex-1 bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-white text-center">
          {currentQuestion.type === 'kanji' ? (
            <p className="text-lg text-gray-500 font-medium">{currentQuestion.questionText}</p>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {currentQuestion.choices.map((choice, idx) => (
          <ChoiceButton
            key={`${currentIndex}-${idx}`}
            label={choice}
            index={idx}
            onClick={() => handleAnswer(choice)}
            state={
              !isRevealed ? 'default' :
                choice === selectedAnswer ? 'selected' : 'disabled'
            }
            isJapanese={currentQuestion.type === 'kanji' || currentQuestion.type === 'reading'}
          />
        ))}
      </div>
    </div>
  );
}
