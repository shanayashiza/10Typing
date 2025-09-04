import React from 'react'
import { Routes, Route, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { useProgress } from '../../hooks/useDatabase'
import { getLevelInfo, getLevelContent, getLessonContent } from '../../data/lessonContent'
import TypingSessionManager from '../../components/typing/TypingSessionManager'
import { useAudio } from '../../components/providers/AudioProvider'

const LearningMode: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <Routes>
        <Route index element={<LevelSelection />} />
        <Route path="level/:levelId" element={<LevelView />} />
        <Route path="lesson/:levelId/:sublevelId" element={<LessonView />} />
      </Routes>
    </div>
  )
}

const LevelSelection: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { playButtonSound } = useAudio()
  const { unlockedLevels, completedSublevels } = useSelector((state: RootState) => state.progress)
  
  const handleLevelClick = (level: number) => {
    if (unlockedLevels.includes(level)) {
      playButtonSound()
      navigate(`level/${level}`)
    }
  }

  const getCompletedCount = (level: number) => {
    return Object.keys(completedSublevels).filter(key => 
      key.startsWith(`${level}-`)
    ).length
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-6">{t('learning.levelSelection')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5].map((level) => {
          const levelInfo = getLevelInfo(level)
          const isUnlocked = unlockedLevels.includes(level)
          const completedCount = getCompletedCount(level)
          const progressPercent = Math.round((completedCount / 20) * 100)
          
          return (
            <button
              key={level}
              onClick={() => handleLevelClick(level)}
              disabled={!isUnlocked}
              className={`game-card text-left transition-all ${
                isUnlocked 
                  ? 'hover:shadow-lg cursor-pointer' 
                  : 'opacity-60 cursor-not-allowed'
              }`}
            >
              <div className={`${levelInfo?.color} w-16 h-16 rounded-lg flex items-center justify-center text-white text-2xl mb-4`}>
                {levelInfo?.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2">
                {t('learning.level', { number: level })}
              </h3>
              <h4 className="font-medium text-gray-800 mb-1">
                {levelInfo?.name['en']}
              </h4>
              <p className="text-gray-600 text-sm mb-4">
                {levelInfo?.description['en']}
              </p>
              
              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{completedCount}/20 {t('learning.completed')}</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  isUnlocked 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {isUnlocked ? 'Available' : t('learning.locked')}
                </span>
                {completedCount === 20 && (
                  <span className="text-green-600 text-xl">✓</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

const LevelView: React.FC = () => {
  const { levelId } = useParams<{ levelId: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { playButtonSound } = useAudio()
  const { completedSublevels, currentLevel, currentSublevel } = useSelector((state: RootState) => state.progress)
  
  const level = parseInt(levelId || '1')
  const levelInfo = getLevelInfo(level)
  
  const handleSublevelClick = (sublevel: number) => {
    playButtonSound()
    navigate(`../lesson/${level}/${sublevel}`)
  }
  
  const isSublevelCompleted = (sublevel: number) => {
    return completedSublevels[`${level}-${sublevel}`] || false
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <button
          onClick={() => navigate('..')}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center space-x-2"
        >
          <span>←</span>
          <span>Back to Level Selection</span>
        </button>
        
        <div className="flex items-center space-x-4">
          <div className={`${levelInfo?.color} w-20 h-20 rounded-lg flex items-center justify-center text-white text-3xl`}>
            {levelInfo?.icon}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('learning.level', { number: level })} - {levelInfo?.name['en']}
            </h1>
            <p className="text-gray-600 text-lg">
              {levelInfo?.description['en']}
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Select a Lesson</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 20 }, (_, i) => i + 1).map((sublevel) => {
            const isCompleted = isSublevelCompleted(sublevel)
            const isCurrent = level === currentLevel && sublevel === currentSublevel
            
            return (
              <button
                key={sublevel}
                onClick={() => handleSublevelClick(sublevel)}
                className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center p-3 transition-all ${
                  isCompleted 
                    ? 'bg-green-100 border-green-400 text-green-800' :
                  isCurrent 
                    ? 'bg-blue-100 border-blue-400 text-blue-800' :
                    'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                }`}
              >
                <div className="text-lg font-bold mb-1">{sublevel}</div>
                <div className="text-xs text-center">
                  {isCompleted ? '✓ Done' :
                   isCurrent ? 'Current' : 'Start'}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const LessonView: React.FC = () => {
  const { levelId, sublevelId } = useParams<{ levelId: string; sublevelId: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { markSublevelComplete } = useProgress()
  
  const level = parseInt(levelId || '1')
  const sublevel = parseInt(sublevelId || '1')
  const lesson = getLessonContent(level, sublevel)
  
  if (!lesson) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Lesson Not Found</h2>
        <button 
          onClick={() => navigate('..')}
          className="text-blue-600 hover:text-blue-800"
        >
          Back to Level
        </button>
      </div>
    )
  }
  
  const handleLessonComplete = async (results: any) => {
    try {
      await markSublevelComplete(level, sublevel, results.wpm, results.accuracy)
      
      if (sublevel < 20) {
        navigate(`../lesson/${level}/${sublevel + 1}`)
      } else {
        navigate('..')
      }
    } catch (error) {
      console.error('Failed to save lesson progress:', error)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <button
          onClick={() => navigate('..')}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center space-x-2"
        >
          <span>←</span>
          <span>Back to Level {level}</span>
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t('learning.level', { number: level })} - {t('learning.sublevel', { number: sublevel })}
            </h1>
            <h2 className="text-xl font-medium text-gray-700 mb-2">{lesson.title}</h2>
            <p className="text-gray-600">{lesson.description}</p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">Target</div>
            <div className="text-lg font-semibold text-blue-600">
              {lesson.targetWpm} WPM • {lesson.minAccuracy}% accuracy
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Instructions:</h3>
          <p className="text-blue-800">
            {lesson.instructions['en']}
          </p>
          {lesson.focusKeys.length > 0 && (
            <div className="mt-2">
              <span className="text-sm text-blue-700">Focus keys: </span>
              <span className="font-mono text-sm bg-blue-200 px-2 py-1 rounded">
                {lesson.focusKeys.join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <TypingSessionManager
        text={lesson.text}
        title={lesson.title}
        onComplete={handleLessonComplete}
        showKeyboard={true}
        showMetrics={true}
        allowRestart={true}
      />
    </div>
  )
}

export default LearningMode