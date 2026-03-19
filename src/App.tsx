import { useState } from 'react'
import './App.css'
import LevelSelectScreen from './components/LevelSelectScreen'
import QuizGame from './components/QuizGame'
import kanjiData from './data/kanjiData.json'

type Level = 'N5' | 'N4' | 'N3'
type GameState = 'levelSelect' | 'quiz'

function App() {
  const [gameState, setGameState] = useState<GameState>('levelSelect')
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null)

  const handleLevelSelect = (level: Level) => {
    setSelectedLevel(level)
    setGameState('quiz')
  }

  const handleBackToLevelSelect = () => {
    setGameState('levelSelect')
    setSelectedLevel(null)
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sakura-50 via-white to-sakura-100 flex flex-col font-sans text-gray-800 transition-colors duration-500 selection:bg-sakura-200">
      <div className="flex-1 w-full flex flex-col h-full max-w-6xl mx-auto py-8 sm:py-12">
        {gameState === 'levelSelect' ? (
          <LevelSelectScreen onLevelSelect={handleLevelSelect} />
        ) : (
          selectedLevel && (
            <QuizGame 
              level={selectedLevel} 
              kanjiList={kanjiData[selectedLevel]}
              onBack={handleBackToLevelSelect}
            />
          )
        )}
      </div>
    </div>
  )
}

export default App
