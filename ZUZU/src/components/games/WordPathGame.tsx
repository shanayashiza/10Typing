import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAudio } from '../providers/AudioProvider'

interface Player {
  x: number
  y: number
}

interface Obstacle {
  id: string
  x: number
  y: number
  type: 'wall' | 'pit' | 'enemy'
}

interface Collectible {
  id: string
  x: number
  y: number
  collected: boolean
}

interface WordPathGameProps {
  onGameComplete?: (results: any) => void
  difficulty?: 'easy' | 'medium' | 'hard'
}

const WordPathGame: React.FC<WordPathGameProps> = ({
  onGameComplete,
  difficulty = 'medium'
}) => {
  const { t } = useTranslation()
  const { playSuccessSound, playErrorSound, playButtonSound } = useAudio()
  
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished' | 'won'>('ready')
  const [player, setPlayer] = useState<Player>({ x: 1, y: 1 })
  const [currentWord, setCurrentWord] = useState('')
  const [typedText, setTypedText] = useState('')
  const [score, setScore] = useState(0)
  const [wordsTyped, setWordsTyped] = useState(0)
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes
  const [level, setLevel] = useState(1)
  
  const gameAreaRef = useRef<HTMLDivElement>(null)
  
  // Game configuration
  const GRID_SIZE = 12
  const CELL_SIZE = 40
  
  // Directional words based on difficulty and language
  const directionalWords = {
    easy: {
      en: ['up', 'down', 'left', 'right', 'go', 'move', 'walk', 'run'],
      id: ['atas', 'bawah', 'kiri', 'kanan', 'jalan', 'gerak', 'lari', 'maju']
    },
    medium: {
      en: ['north', 'south', 'east', 'west', 'forward', 'backward', 'advance', 'retreat'],
      id: ['utara', 'selatan', 'timur', 'barat', 'maju', 'mundur', 'melangkah', 'bergerak']
    },
    hard: {
      en: ['northeast', 'northwest', 'southeast', 'southwest', 'diagonal', 'straight', 'sideways'],
      id: ['tenggara', 'timur-laut', 'barat-daya', 'barat-laut', 'diagonal', 'lurus', 'menyamping']
    }
  }
  
  // Generate obstacles and collectibles
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const [collectibles, setCollectibles] = useState<Collectible[]>([])
  const [goalPosition] = useState({ x: GRID_SIZE - 2, y: GRID_SIZE - 2 })
  
  const generateLevel = useCallback(() => {
    const newObstacles: Obstacle[] = []
    const newCollectibles: Collectible[] = []
    
    // Generate random obstacles
    for (let i = 0; i < 15 + level * 2; i++) {
      const x = Math.floor(Math.random() * GRID_SIZE)
      const y = Math.floor(Math.random() * GRID_SIZE)
      
      // Don't place obstacles on start or goal positions
      if ((x === 1 && y === 1) || (x === goalPosition.x && y === goalPosition.y)) continue
      
      newObstacles.push({
        id: `obstacle-${i}`,
        x, y,
        type: Math.random() < 0.7 ? 'wall' : Math.random() < 0.8 ? 'pit' : 'enemy'
      })
    }
    
    // Generate collectibles
    for (let i = 0; i < 5; i++) {
      let x, y
      do {
        x = Math.floor(Math.random() * GRID_SIZE)
        y = Math.floor(Math.random() * GRID_SIZE)
      } while (
        newObstacles.some(obs => obs.x === x && obs.y === y) ||
        (x === 1 && y === 1) || (x === goalPosition.x && y === goalPosition.y)
      )
      
      newCollectibles.push({
        id: `collectible-${i}`,
        x, y,
        collected: false
      })
    }
    
    setObstacles(newObstacles)
    setCollectibles(newCollectibles)
  }, [level, goalPosition])
  
  const getRandomWord = useCallback(() => {
    const lang = 'en' // Can be made dynamic based on user preference
    const words = directionalWords[difficulty][lang]
    return words[Math.floor(Math.random() * words.length)]
  }, [difficulty])
  
  const startGame = () => {
    setGameState('playing')
    setPlayer({ x: 1, y: 1 })
    setScore(0)
    setWordsTyped(0)
    setTimeLeft(120)
    setLevel(1)
    setCurrentWord(getRandomWord())
    setTypedText('')
    generateLevel()
    playButtonSound()
  }
  
  const movePlayer = (direction: string) => {
    const movements: Record<string, { dx: number, dy: number }> = {
      // English words
      'up': { dx: 0, dy: -1 },
      'down': { dx: 0, dy: 1 },
      'left': { dx: -1, dy: 0 },
      'right': { dx: 1, dy: 0 },
      'north': { dx: 0, dy: -1 },
      'south': { dx: 0, dy: 1 },
      'east': { dx: 1, dy: 0 },
      'west': { dx: -1, dy: 0 },
      'northeast': { dx: 1, dy: -1 },
      'northwest': { dx: -1, dy: -1 },
      'southeast': { dx: 1, dy: 1 },
      'southwest': { dx: -1, dy: 1 },
      'forward': { dx: 0, dy: -1 },
      'backward': { dx: 0, dy: 1 },
      'go': { dx: 0, dy: -1 },
      'move': { dx: 1, dy: 0 },
      'walk': { dx: 0, dy: -1 },
      'run': { dx: 2, dy: 0 }, // Move 2 spaces
      'advance': { dx: 0, dy: -1 },
      'retreat': { dx: 0, dy: 1 },
      // Indonesian words
      'atas': { dx: 0, dy: -1 },
      'bawah': { dx: 0, dy: 1 },
      'kiri': { dx: -1, dy: 0 },
      'kanan': { dx: 1, dy: 0 },
      'utara': { dx: 0, dy: -1 },
      'selatan': { dx: 0, dy: 1 },
      'timur': { dx: 1, dy: 0 },
      'barat': { dx: -1, dy: 0 }
    }
    
    const movement = movements[direction.toLowerCase()]
    if (!movement) return false
    
    setPlayer(prev => {
      const newX = Math.max(0, Math.min(GRID_SIZE - 1, prev.x + movement.dx))
      const newY = Math.max(0, Math.min(GRID_SIZE - 1, prev.y + movement.dy))
      
      // Check for obstacles
      const hasObstacle = obstacles.some(obs => obs.x === newX && obs.y === newY)
      if (hasObstacle) {
        playErrorSound()
        return prev // Don't move if there's an obstacle
      }
      
      // Check for collectibles
      const collectibleIndex = collectibles.findIndex(col => 
        col.x === newX && col.y === newY && !col.collected
      )
      if (collectibleIndex !== -1) {
        setCollectibles(prev => 
          prev.map((col, idx) => 
            idx === collectibleIndex ? { ...col, collected: true } : col
          )
        )
        setScore(s => s + 50)
        playSuccessSound()
      }
      
      // Check for goal
      if (newX === goalPosition.x && newY === goalPosition.y) {
        setGameState('won')
        setScore(s => s + 200 + timeLeft * 2) // Time bonus
      }
      
      return { x: newX, y: newY }
    })
    
    return true
  }
  
  const handleWordComplete = () => {
    const success = movePlayer(currentWord)
    if (success) {
      setWordsTyped(w => w + 1)
      setScore(s => s + 10)
    }
    setCurrentWord(getRandomWord())
    setTypedText('')
  }
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (gameState !== 'playing') return
    
    const key = e.key
    
    if (key === 'Backspace') {
      setTypedText(prev => prev.slice(0, -1))
      return
    }
    
    if (key.length === 1) {
      const newTypedText = typedText + key
      setTypedText(newTypedText)
      
      if (newTypedText === currentWord) {
        handleWordComplete()
      } else if (!currentWord.startsWith(newTypedText)) {
        // Wrong character
        playErrorSound()
        setTypedText('')
      }
    }
  }
  
  // Timer
  useEffect(() => {
    if (gameState === 'playing') {
      const timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setGameState('finished')
            return 0
          }
          return t - 1
        })
      }, 1000)
      
      return () => clearInterval(timer)
    }
  }, [gameState])
  
  // Handle game completion
  useEffect(() => {
    if (gameState === 'finished' || gameState === 'won') {
      const wpm = Math.round((wordsTyped * 60) / (120 - timeLeft || 1))
      onGameComplete?.({
        score,
        wpm,
        accuracy: 90, // Calculate based on errors
        wordsTyped,
        timeElapsed: 120 - timeLeft,
        completed: gameState === 'won'
      })
    }
  }, [gameState, score, wordsTyped, timeLeft, onGameComplete])
  
  const getCellContent = (x: number, y: number) => {
    if (player.x === x && player.y === y) return '🚶'
    if (goalPosition.x === x && goalPosition.y === y) return '🏁'
    
    const obstacle = obstacles.find(obs => obs.x === x && obs.y === y)
    if (obstacle) {
      switch (obstacle.type) {
        case 'wall': return '🧱'
        case 'pit': return '🕳️'
        case 'enemy': return '👾'
        default: return '⬛'
      }
    }
    
    const collectible = collectibles.find(col => col.x === x && col.y === y)
    if (collectible && !collectible.collected) return '💎'
    
    return ''
  }
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{t('games.wordPath')}</h1>
          <div className="text-lg font-bold text-blue-600">{formatTime(timeLeft)}</div>
        </div>
        
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="bg-blue-50 rounded p-3">
            <div className="text-2xl font-bold text-blue-600">{score}</div>
            <div className="text-sm text-gray-600">Score</div>
          </div>
          <div className="bg-green-50 rounded p-3">
            <div className="text-2xl font-bold text-green-600">{wordsTyped}</div>
            <div className="text-sm text-gray-600">Words</div>
          </div>
          <div className="bg-purple-50 rounded p-3">
            <div className="text-2xl font-bold text-purple-600">{level}</div>
            <div className="text-sm text-gray-600">Level</div>
          </div>
          <div className="bg-orange-50 rounded p-3">
            <div className="text-2xl font-bold text-orange-600">
              {collectibles.filter(c => c.collected).length}/{collectibles.length}
            </div>
            <div className="text-sm text-gray-600">Gems</div>
          </div>
        </div>
      </div>
      
      {/* Game Area */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex gap-6">
          {/* Game Grid */}
          <div 
            className="grid gap-1 bg-gray-200 p-2 rounded"
            style={{ 
              gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`
            }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
              const x = i % GRID_SIZE
              const y = Math.floor(i / GRID_SIZE)
              return (
                <div
                  key={i}
                  className="bg-green-100 border border-green-200 flex items-center justify-center text-lg"
                  style={{ width: CELL_SIZE, height: CELL_SIZE }}
                >
                  {getCellContent(x, y)}
                </div>
              )
            })}
          </div>
          
          {/* Instructions Panel */}
          <div className="flex-1 space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-bold text-blue-900 mb-2">Current Word:</h3>
              <div className="text-3xl font-mono font-bold text-center mb-2">
                {currentWord}
              </div>
              <div className="text-lg font-mono text-center">
                <span className="text-green-600">{typedText}</span>
                <span className="text-gray-400">{currentWord.slice(typedText.length)}</span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Legend:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>🚶 You</div>
                <div>🏁 Goal</div>
                <div>💎 Gems</div>
                <div>🧱 Wall</div>
                <div>🕳️ Pit</div>
                <div>👾 Enemy</div>
              </div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Instructions:</h4>
              <ul className="text-sm space-y-1">
                <li>• Type the directional word to move</li>
                <li>• Collect gems for bonus points</li>
                <li>• Avoid obstacles</li>
                <li>• Reach the goal flag!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Input Area */}
      {gameState === 'playing' && (
        <div className="bg-white rounded-lg shadow p-6">
          <input
            type="text"
            value={typedText}
            onChange={() => {}} // Controlled by keydown
            onKeyDown={handleKeyPress}
            className="w-full text-2xl font-mono text-center p-4 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Type the word above..."
            autoFocus
          />
        </div>
      )}
      
      {/* Game State Overlays */}
      {gameState === 'ready' && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">🗺️ Ready for Adventure?</h2>
          <p className="text-lg mb-6">Type directional words to navigate through obstacles!</p>
          <button
            onClick={startGame}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg"
          >
            {t('common.start')}
          </button>
        </div>
      )}
      
      {(gameState === 'finished' || gameState === 'won') && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {gameState === 'won' ? '🏆 Victory!' : '⏰ Time Up!'}
          </h2>
          <div className="space-y-2 mb-6">
            <p className="text-xl">Final Score: <span className="font-bold text-blue-600">{score}</span></p>
            <p>Words Typed: <span className="text-green-600">{wordsTyped}</span></p>
            <p>Gems Collected: <span className="text-purple-600">
              {collectibles.filter(c => c.collected).length}
            </span></p>
          </div>
          <button
            onClick={startGame}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg"
          >
            {t('games.playAgain')}
          </button>
        </div>
      )}
    </div>
  )
}

export default WordPathGame