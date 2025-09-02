import React from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAudio } from '../../components/providers/AudioProvider'
import CatchLetterGame from '../../components/games/CatchLetterGame'
import WordPathGame from '../../components/games/WordPathGame'
import SentenceLauncherGame from '../../components/games/SentenceLauncherGame'
import { usePerformance } from '../../hooks/useDatabase'

const GameMode: React.FC = () => {
  return (
    <div className="space-y-6">
      <Routes>
        <Route index element={<GameSelection />} />
        <Route path="catch-letter" element={<CatchLetterGameView />} />
        <Route path="word-path" element={<WordPathGameView />} />
        <Route path="sentence-launcher" element={<SentenceLauncherGameView />} />
        <Route path="speed-duel" element={<GameView gameType="speed-duel" />} />
      </Routes>
    </div>
  )
}

const GameSelection: React.FC = () => {
  const { t } = useTranslation()
  const { playButtonSound } = useAudio()
  const navigate = useNavigate()

  const games = [
    {
      id: 'catch-letter',
      name: t('games.catchLetter'),
      description: 'Catch falling letters by typing them quickly!',
      icon: '💫',
      color: 'bg-blue-500',
      available: true
    },
    {
      id: 'word-path',
      name: t('games.wordPath'),
      description: 'Navigate your character by typing directional words!',
      icon: '🏃',
      color: 'bg-green-500',
      available: true
    },
    {
      id: 'sentence-launcher',
      name: t('games.sentenceLauncher'),
      description: 'Launch projectiles by typing complete sentences!',
      icon: '🚀',
      color: 'bg-purple-500',
      available: true
    },
    {
      id: 'speed-duel',
      name: t('games.speedDuel'),
      description: 'Race against AI opponents in speed typing!',
      icon: '⚡',
      color: 'bg-yellow-500',
      available: false
    },
  ]

  const handleGameSelect = (gameId: string, available: boolean) => {
    if (!available) return
    
    playButtonSound()
    navigate(gameId)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6">{t('games.selectGame')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() => handleGameSelect(game.id, game.available)}
            disabled={!game.available}
            className={`game-card text-left transition-all ${
              game.available 
                ? 'hover:shadow-lg cursor-pointer' 
                : 'opacity-60 cursor-not-allowed'
            }`}
          >
            <div className={`${game.color} w-16 h-16 rounded-lg flex items-center justify-center text-white text-2xl mb-4`}>
              {game.icon}
            </div>
            <h3 className="font-semibold text-lg mb-2">{game.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{game.description}</p>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {game.available ? 'Available' : 'Coming Soon'}
              </span>
              <span className={`font-medium ${
                game.available ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {game.available ? 'Play →' : 'Soon'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

const WordPathGameView: React.FC = () => {
  const navigate = useNavigate()
  const { saveSession } = usePerformance()
  
  const handleGameComplete = async (results: any) => {
    try {
      await saveSession({
        mode: 'game',
        detailMode: 'Word Path Game',
        wpm: results.wpm || 0,
        accuracy: results.accuracy || 0,
        errorCount: 0,
        duration: results.timeElapsed || 120
      })
    } catch (error) {
      console.error('Failed to save game session:', error)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-4">
        <button
          onClick={() => navigate('..')}
          className="text-blue-600 hover:text-blue-800 flex items-center space-x-2"
        >
          <span>←</span>
          <span>Back to Games</span>
        </button>
      </div>
      
      <WordPathGame 
        onGameComplete={handleGameComplete}
        difficulty="medium"
      />
    </div>
  )
}

const SentenceLauncherGameView: React.FC = () => {
  const navigate = useNavigate()
  const { saveSession } = usePerformance()
  
  const handleGameComplete = async (results: any) => {
    try {
      await saveSession({
        mode: 'game',
        detailMode: 'Sentence Launcher Game',
        wpm: results.wpm || 0,
        accuracy: results.accuracy || 0,
        errorCount: 0,
        duration: results.timeElapsed || 180
      })
    } catch (error) {
      console.error('Failed to save game session:', error)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-4">
        <button
          onClick={() => navigate('..')}
          className="text-blue-600 hover:text-blue-800 flex items-center space-x-2"
        >
          <span>←</span>
          <span>Back to Games</span>
        </button>
      </div>
      
      <SentenceLauncherGame 
        onGameComplete={handleGameComplete}
        difficulty="medium"
      />
    </div>
  )
}

interface GameViewProps {
  gameType: string
}

const GameView: React.FC<GameViewProps> = ({ gameType }) => {
  const { t } = useTranslation()

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6">
        {t('games.speedDuel')}
      </h1>
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚡</div>
        <p className="text-gray-600">
          Speed Duel game coming soon!
        </p>
      </div>
    </div>
  )
}

export default GameMode