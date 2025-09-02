import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import VirtualKeyboard from './VirtualKeyboard'
import TypingArea from './TypingArea'
import PerformanceMetrics from './PerformanceMetrics'
import { useAudio } from '../providers/AudioProvider'

interface TypingSessionManagerProps {
  text: string
  title?: string
  onComplete?: (results: TypingResults) => void
  onProgress?: (progress: TypingProgress) => void
  showKeyboard?: boolean
  showMetrics?: boolean
  allowRestart?: boolean
  className?: string
}

interface TypingResults {
  wpm: number
  accuracy: number
  errorCount: number
  timeElapsed: number
  completedAt: Date
}

interface TypingProgress {
  currentIndex: number
  totalCharacters: number
  correctCharacters: number
  errorCount: number
  wpm: number
  accuracy: number
}

const TypingSessionManager: React.FC<TypingSessionManagerProps> = ({
  text,
  title,
  onComplete,
  onProgress,
  showKeyboard = true,
  showMetrics = true,
  allowRestart = true,
  className = ''
}) => {
  const { t } = useTranslation()
  const { playTypingSound, playSuccessSound, playErrorSound } = useAudio()
  
  // Session state
  const [sessionState, setSessionState] = useState<'ready' | 'active' | 'paused' | 'completed'>('ready')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [endTime, setEndTime] = useState<number | null>(null)
  
  // Typing metrics
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctCharacters, setCorrectCharacters] = useState(0)
  const [errorCount, setErrorCount] = useState(0)
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set())
  
  // Reset session when text changes
  useEffect(() => {
    resetSession()
  }, [text])

  const resetSession = () => {
    setSessionState('ready')
    setStartTime(null)
    setEndTime(null)
    setCurrentIndex(0)
    setCorrectCharacters(0)
    setErrorCount(0)
    setPressedKeys(new Set())
  }

  const startSession = () => {
    setSessionState('active')
    setStartTime(Date.now())
    setEndTime(null)
  }

  const pauseSession = () => {
    if (sessionState === 'active') {
      setSessionState('paused')
    }
  }

  const resumeSession = () => {
    if (sessionState === 'paused') {
      setSessionState('active')
    }
  }

  const completeSession = useCallback(() => {
    const now = Date.now()
    setEndTime(now)
    setSessionState('completed')

    if (onComplete && startTime) {
      const timeElapsed = (now - startTime) / 1000
      const wpm = Math.round((correctCharacters / 5) / (timeElapsed / 60))
      const accuracy = Math.round((correctCharacters / Math.max(currentIndex, 1)) * 100)

      const results: TypingResults = {
        wpm,
        accuracy,
        errorCount,
        timeElapsed: Math.round(timeElapsed),
        completedAt: new Date()
      }

      onComplete(results)
      playSuccessSound()
    }
  }, [correctCharacters, currentIndex, errorCount, startTime, onComplete, playSuccessSound])

  const handleCharacterTyped = (char: string, isCorrect: boolean) => {
    // Start session on first keypress
    if (sessionState === 'ready') {
      startSession()
    }

    // Update metrics
    setCurrentIndex(prev => prev + 1)
    if (isCorrect) {
      setCorrectCharacters(prev => prev + 1)
      playTypingSound()
    } else {
      setErrorCount(prev => prev + 1)
      playErrorSound()
    }

    // Update progress callback
    if (onProgress) {
      const newIndex = currentIndex + 1
      const newCorrect = isCorrect ? correctCharacters + 1 : correctCharacters
      const newErrors = isCorrect ? errorCount : errorCount + 1
      
      const timeElapsed = startTime ? (Date.now() - startTime) / 1000 : 0
      const wpm = timeElapsed > 0 ? Math.round((newCorrect / 5) / (timeElapsed / 60)) : 0
      const accuracy = Math.round((newCorrect / Math.max(newIndex, 1)) * 100)

      onProgress({
        currentIndex: newIndex,
        totalCharacters: text.length,
        correctCharacters: newCorrect,
        errorCount: newErrors,
        wpm,
        accuracy
      })
    }
  }

  // Keyboard event handler for pressed keys visualization
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (sessionState === 'active') {
        setPressedKeys(prev => new Set(prev).add(e.key.toLowerCase()))
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      setPressedKeys(prev => {
        const newSet = new Set(prev)
        newSet.delete(e.key.toLowerCase())
        return newSet
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [sessionState])

  const getCurrentCharacter = () => {
    return currentIndex < text.length ? text[currentIndex] : ''
  }

  const getSessionDuration = () => {
    if (!startTime) return 0
    const endTimeToUse = endTime || Date.now()
    return Math.round((endTimeToUse - startTime) / 1000)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      {title && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <div className="flex justify-center items-center space-x-4 text-sm text-gray-600">
            <span>Length: {text.length} characters</span>
            <span>•</span>
            <span>Est. time: ~{Math.round(text.length / 250)} min</span>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {showMetrics && (
        <PerformanceMetrics
          isActive={sessionState === 'active'}
          totalCharacters={currentIndex}
          correctCharacters={correctCharacters}
          errorCount={errorCount}
          startTime={startTime || undefined}
          showDetailedStats={sessionState === 'completed'}
        />
      )}

      {/* Typing Area */}
      <TypingArea
        text={text}
        onCharacterTyped={handleCharacterTyped}
        onComplete={completeSession}
        disabled={sessionState === 'completed'}
      />

      {/* Virtual Keyboard */}
      {showKeyboard && (
        <VirtualKeyboard
          currentChar={getCurrentCharacter()}
          pressedKeys={pressedKeys}
        />
      )}

      {/* Session Controls */}
      <div className="flex justify-center space-x-4">
        {sessionState === 'ready' && (
          <div className="text-center text-gray-500">
            <p className="mb-4">Click in the text area above and start typing to begin</p>
          </div>
        )}

        {sessionState === 'active' && (
          <button
            onClick={pauseSession}
            className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
          >
            {t('common.pause')}
          </button>
        )}

        {sessionState === 'paused' && (
          <div className="flex space-x-4">
            <button
              onClick={resumeSession}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              {t('common.resume')}
            </button>
            {allowRestart && (
              <button
                onClick={resetSession}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                {t('common.restart')}
              </button>
            )}
          </div>
        )}

        {sessionState === 'completed' && (
          <div className="flex flex-col items-center space-y-4">
            <div className="text-center">
              <div className="text-2xl text-green-600 mb-2">🎉</div>
              <p className="text-lg font-medium text-green-700">
                {t('learning.lessonComplete')}
              </p>
              <p className="text-sm text-gray-600">
                Completed in {getSessionDuration()} seconds
              </p>
            </div>
            
            {allowRestart && (
              <button
                onClick={resetSession}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {t('common.restart')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Session Info */}
      <div className="text-center text-sm text-gray-500">
        Status: 
        <span className={`ml-2 font-medium ${
          sessionState === 'active' ? 'text-green-600' :
          sessionState === 'paused' ? 'text-yellow-600' :
          sessionState === 'completed' ? 'text-blue-600' :
          'text-gray-600'
        }`}>
          {sessionState.charAt(0).toUpperCase() + sessionState.slice(1)}
        </span>
        {startTime && (
          <span className="ml-4">
            Duration: {getSessionDuration()}s
          </span>
        )}
      </div>
    </div>
  )
}

export default TypingSessionManager