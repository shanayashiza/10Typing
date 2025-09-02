import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAudio } from '../../providers/AudioProvider';

interface SentenceLauncherGameProps {
  onGameComplete?: (results: any) => void;
  difficulty?: 'easy' | 'medium' | 'hard';
}

const SentenceLauncherGame: React.FC<SentenceLauncherGameProps> = ({
  onGameComplete,
  difficulty = 'medium'
}) => {
  const { t } = useTranslation()
  const { playSuccessSound, playErrorSound } = useAudio()
  
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'finished'>('ready')
  const [currentSentence, setCurrentSentence] = useState('')
  const [typedText, setTypedText] = useState('')
  const [score, setScore] = useState(0)
  const [sentencesTyped, setSentencesTyped] = useState(0)
  const [timeLeft, setTimeLeft] = useState(180)
  const [targetsHit, setTargetsHit] = useState(0)
  
  const sentences = {
    easy: [
      'The cat runs fast.',
      'I like to play games.',
      'The sun is bright today.',
      'She reads a good book.',
    ],
    medium: [
      'The quick brown fox jumps over the lazy dog.',
      'Technology has revolutionized the way we communicate.',
      'Learning to type quickly improves productivity significantly.',
    ],
    hard: [
      'The establishment of comprehensive educational systems requires careful planning.',
      'Artificial intelligence algorithms are transforming various industries rapidly.',
    ]
  }
  
  const getRandomSentence = useCallback(() => {
    const sentenceList = sentences[difficulty]
    return sentenceList[Math.floor(Math.random() * sentenceList.length)]
  }, [difficulty])
  
  const startGame = () => {
    setGameState('playing')
    setScore(0)
    setSentencesTyped(0)
    setTimeLeft(180)
    setTargetsHit(0)
    setCurrentSentence(getRandomSentence())
    setTypedText('')
  }
  
  const handleSentenceComplete = () => {
    const points = difficulty === 'easy' ? 50 : difficulty === 'medium' ? 100 : 150
    setScore(s => s + points)
    setSentencesTyped(s => s + 1)
    setTargetsHit(h => h + 1)
    setCurrentSentence(getRandomSentence())
    setTypedText('')
    playSuccessSound()
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
      
      if (newTypedText === currentSentence) {
        handleSentenceComplete()
      } else if (!currentSentence.startsWith(newTypedText)) {
        playErrorSound()
      }
    }
  }
  
  useEffect(() => {
    if (gameState === 'playing') {
      const timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setGameState('finished')
            onGameComplete?.({
              score,
              sentencesTyped,
              accuracy: 95,
              timeElapsed: 180,
              targetsHit
            })
            return 0
          }
          return t - 1
        })
      }, 1000)
      
      return () => clearInterval(timer)
    }
  }, [gameState, score, sentencesTyped, targetsHit, onGameComplete])
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{t('games.sentenceLauncher')}</h1>
          <div className="text-lg font-bold text-blue-600">{formatTime(timeLeft)}</div>
        </div>
        
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="bg-blue-50 rounded p-3">
            <div className="text-2xl font-bold text-blue-600">{score}</div>
            <div className="text-sm text-gray-600">Score</div>
          </div>
          <div className="bg-green-50 rounded p-3">
            <div className="text-2xl font-bold text-green-600">{sentencesTyped}</div>
            <div className="text-sm text-gray-600">Sentences</div>
          </div>
          <div className="bg-purple-50 rounded p-3">
            <div className="text-2xl font-bold text-purple-600">{targetsHit}</div>
            <div className="text-sm text-gray-600">Targets Hit</div>
          </div>
          <div className="bg-orange-50 rounded p-3">
            <div className="text-2xl font-bold text-orange-600">{difficulty}</div>
            <div className="text-sm text-gray-600">Difficulty</div>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-b from-sky-200 to-sky-300 rounded-lg shadow relative">
        <div className="h-64 flex items-center justify-center">
          <div className="text-6xl">🎯</div>
        </div>
        
        {gameState === 'ready' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold mb-4">🚀 Ready to Launch?</h2>
              <button
                onClick={startGame}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg"
              >
                {t('common.start')}
              </button>
            </div>
          </div>
        )}
        
        {gameState === 'finished' && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <div className="text-center text-white bg-gray-800 rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-4">🎯 Mission Complete!</h2>
              <p className="text-xl mb-4">Score: {score}</p>
              <button
                onClick={startGame}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg"
              >
                {t('games.playAgain')}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {gameState === 'playing' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">Type this sentence:</h3>
            <div className="text-xl font-mono p-4 bg-gray-50 rounded border-2">
              <span className="text-green-600">{typedText}</span>
              <span className="text-gray-800">{currentSentence.slice(typedText.length)}</span>
            </div>
          </div>
          
          <input
            type="text"
            value={typedText}
            onChange={() => {}}
            onKeyDown={handleKeyPress}
            className="w-full text-lg font-mono p-4 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500"
            placeholder="Start typing here..."
            autoFocus
          />
        </div>
      )}
    </div>
  )
}


export default SentenceLauncherGame


