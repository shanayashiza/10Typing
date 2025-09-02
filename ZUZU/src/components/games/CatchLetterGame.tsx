import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAudio } from '../providers/AudioProvider'

interface FallingLetter {
  id: string
  letter: string
  x: number
  y: number
  speed: number
  color: string
}

interface CatchLetterGameProps {
  onGameComplete?: (results: any) => void
  difficulty?: 'easy' | 'medium' | 'hard'
}

const CatchLetterGame: React.FC<CatchLetterGameProps> = ({
  onGameComplete,
  difficulty = 'medium'
}) => {
  const { t } = useTranslation()
  const { playSuccessSound, playErrorSound } = useAudio()
  
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready')
  const [score, setScore] = useState(0)
  const [letters, setLetters] = useState<FallingLetter[]>([])
  const [timeLeft, setTimeLeft] = useState(60)
  const [lettersTyped, setLettersTyped] = useState(0)
  
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const letterIdRef = useRef(0)
  
  const gameConfig = {
    easy: { fallSpeed: 1, spawnRate: 2000, letters: 'abcdefghij' },
    medium: { fallSpeed: 2, spawnRate: 1500, letters: 'abcdefghijklmnopqrstuvwxyz' },
    hard: { fallSpeed: 3, spawnRate: 1000, letters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' }
  }[difficulty]
  
  const startGame = () => {
    setGameState('playing')
    setScore(0)
    setLetters([])
    setTimeLeft(60)
    setLettersTyped(0)
  }
  
  const spawnLetter = useCallback(() => {
    if (gameState !== 'playing' || !gameAreaRef.current) return
    
    const gameArea = gameAreaRef.current
    const randomLetter = gameConfig.letters[Math.floor(Math.random() * gameConfig.letters.length)]
    
    const newLetter: FallingLetter = {
      id: `letter-${letterIdRef.current++}`,
      letter: randomLetter,
      x: Math.random() * (gameArea.clientWidth - 40),
      y: -40,
      speed: gameConfig.fallSpeed,
      color: 'text-blue-600'
    }
    
    setLetters(prev => [...prev, newLetter])
  }, [gameState, gameConfig])
  
  const updateLetters = useCallback(() => {
    if (gameState !== 'playing') return
    
    setLetters(prev => {
      const gameHeight = gameAreaRef.current?.clientHeight || 400
      return prev
        .map(letter => ({ ...letter, y: letter.y + letter.speed }))
        .filter(letter => letter.y < gameHeight)
    })
  }, [gameState])
  
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (gameState !== 'playing') return
    
    const typedKey = e.key
    
    setLetters(prev => {
      const matchingIndex = prev.findIndex(letter => letter.letter === typedKey)
      
      if (matchingIndex !== -1) {
        playSuccessSound()
        setScore(s => s + 10)
        setLettersTyped(t => t + 1)
        return prev.filter((_, index) => index !== matchingIndex)
      } else {
        playErrorSound()
        return prev
      }
    })
  }, [gameState, playSuccessSound, playErrorSound])
  
  // Game loops and timers
  useEffect(() => {
    if (gameState === 'playing') {
      const gameLoop = setInterval(updateLetters, 50)
      const spawner = setInterval(spawnLetter, gameConfig.spawnRate)
      const timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setGameState('finished')
            onGameComplete?.({ score, lettersTyped, accuracy: 90 })
            return 0
          }
          return t - 1
        })
      }, 1000)
      
      return () => {
        clearInterval(gameLoop)
        clearInterval(spawner)
        clearInterval(timer)
      }
    }
  }, [gameState, updateLetters, spawnLetter, gameConfig.spawnRate, score, lettersTyped, onGameComplete])
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{t('games.catchLetter')}</h1>
          <div className="text-lg font-bold text-blue-600">{timeLeft}s</div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-blue-50 rounded p-3">
            <div className="text-2xl font-bold text-blue-600">{score}</div>
            <div className="text-sm text-gray-600">Score</div>
          </div>
          <div className="bg-green-50 rounded p-3">
            <div className="text-2xl font-bold text-green-600">{lettersTyped}</div>
            <div className="text-sm text-gray-600">Caught</div>
          </div>
          <div className="bg-purple-50 rounded p-3">
            <div className="text-2xl font-bold text-purple-600">{difficulty}</div>
            <div className="text-sm text-gray-600">Difficulty</div>
          </div>
        </div>
      </div>
      
      {/* Game Area */}
      <div className="bg-gradient-to-b from-blue-100 to-blue-200 rounded-lg shadow relative overflow-hidden">
        <div ref={gameAreaRef} className="relative h-96">
          {letters.map(letter => (
            <div
              key={letter.id}
              className={`absolute text-4xl font-bold ${letter.color}`}
              style={{
                left: `${letter.x}px`,
                top: `${letter.y}px`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {letter.letter}
            </div>
          ))}
          
          {gameState === 'ready' && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-center text-white">
                <h2 className="text-3xl font-bold mb-4">Ready to Catch Letters?</h2>
                <button
                  onClick={startGame}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg"
                >
                  {t('common.start')}
                </button>
              </div>
            </div>
          )}
          
          {gameState === 'finished' && (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
              <div className="text-center text-white bg-gray-800 rounded-lg p-8">
                <h2 className="text-3xl font-bold mb-4">🎉 Game Complete!</h2>
                <p className="text-xl mb-4">Score: {score}</p>
                <button
                  onClick={startGame}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg"
                >
                  {t('games.playAgain')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CatchLetterGame