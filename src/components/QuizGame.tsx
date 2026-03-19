import { useState } from 'react'
import AutocompleteInput from './AutocompleteInput'
import ResultModal from './ResultModal'
import ProgressBar from './ProgressBar'

interface Kanji {
  id: string
  kanji: string
  onyomi: string
  kunyomi: string
  meaning: string
  meaningVi: string
  examples: Array<{
    kana: string
    romaji: string
    meaning: string
    meaningVi: string
  }>
}

interface QuizGameProps {
  level: 'N5' | 'N4' | 'N3'
  kanjiList: Kanji[]
  onBack: () => void
}

export default function QuizGame({ level, kanjiList, onBack }: QuizGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedKanji, setSelectedKanji] = useState<Kanji | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [gameEnded, setGameEnded] = useState(false)

  const currentKanji = kanjiList[currentIndex]
  const isCorrect = selectedKanji?.id === currentKanji.id

  const handleSelectKanji = (kanji: Kanji) => {
    setSelectedKanji(kanji)
    setIsAnswered(true)
    if (kanji.id === currentKanji.id) {
      setScore((prev) => prev + 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < kanjiList.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setSelectedKanji(null)
      setIsAnswered(false)
    } else {
      setGameEnded(true)
    }
  }

  const handlePlayAgain = () => {
    setCurrentIndex(0)
    setSelectedKanji(null)
    setIsAnswered(false)
    setScore(0)
    setGameEnded(false)
  }

  if (gameEnded) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 w-full h-full animate-fade-in-up">
        <div className="max-w-2xl w-full">
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl p-12 text-center border border-white/40">
            <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-gray-800 to-gray-600 mb-6">
              Quiz Complete! 🎉
            </h2>

            <div className="mb-12">
              <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-sakura-500 to-sakura-600 mb-4 drop-shadow-sm">
                {score} <span className="text-5xl text-gray-400">/ {kanjiList.length}</span>
              </div>
              <p className="text-xl text-gray-500 font-medium">
                You got <span className="text-sakura-600 font-bold">{Math.round((score / kanjiList.length) * 100)}%</span> correct!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm">
                <div className="text-4xl font-black text-emerald-500 mb-2">
                  {score}
                </div>
                <p className="text-emerald-700 font-semibold tracking-wide uppercase text-sm">Correct Answers</p>
              </div>
              <div className="p-6 bg-rose-50 rounded-2xl border border-rose-100 shadow-sm">
                <div className="text-4xl font-black text-rose-500 mb-2">
                  {kanjiList.length - score}
                </div>
                <p className="text-rose-700 font-semibold tracking-wide uppercase text-sm">Wrong Answers</p>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={handlePlayAgain}
                className="px-8 py-4 bg-gradient-to-r from-sakura-500 to-sakura-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-sakura-200 transform hover:-translate-y-1 transition-all duration-200"
              >
                Play Again
              </button>
              <button
                onClick={onBack}
                className="px-8 py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-bold hover:border-gray-300 hover:bg-gray-50 transform hover:-translate-y-1 transition-all duration-200"
              >
                Back to Levels
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col p-6 w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-sm">
        <div className="flex items-center gap-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors font-medium px-4 py-2 hover:bg-white/80 rounded-lg"
          >
            <span className="text-xl">&larr;</span> Back
          </button>
          <div className="hidden sm:block h-8 w-px bg-gray-300"></div>
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600">
            JLPT {level} Quiz
          </h1>
        </div>
        <div className="flex items-center gap-4 px-6 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Score</p>
          <p className="text-3xl font-black text-sakura-500">{score}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-10 w-full max-w-3xl mx-auto">
        <ProgressBar current={currentIndex + 1} total={kanjiList.length} />
      </div>

      {/* Main Quiz Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-3xl mx-auto">
        {!isAnswered ? (
          <div className="w-full flex flex-col items-center animate-fade-in-up">
            <p className="text-lg text-gray-500 mb-8 font-medium tracking-wide">
              What is the reading of this Kanji?
            </p>
            {/* Kanji Card */}
            <div className="w-full relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-sakura-300 to-sakura-500 rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-16 mb-12 flex flex-col items-center border border-white">
                <div className="text-9xl font-black text-gray-800 jp-text mb-8 drop-shadow-md">
                  {currentKanji.kanji}
                </div>
                <div className="px-6 py-2 bg-sakura-50 rounded-full border border-sakura-100">
                  <p className="text-xl text-gray-600 font-medium">
                    Meaning: <span className="text-sakura-600 font-bold ml-2">{currentKanji.meaningVi}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="w-full">
              <AutocompleteInput
                kanjiList={kanjiList}
                currentKanji={currentKanji}
                onSelect={handleSelectKanji}
              />
            </div>
          </div>
        ) : (
          selectedKanji && (
            <ResultModal
              kanji={selectedKanji}
              isCorrect={isCorrect}
              targetKanji={currentKanji}
              onNext={handleNext}
            />
          )
        )}
      </div>
    </div>
  )
}
