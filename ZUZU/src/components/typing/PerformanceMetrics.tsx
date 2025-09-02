import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { updateCurrentSession } from '../../store/slices/performanceSlice'

interface PerformanceMetricsProps {
  isActive?: boolean
  totalCharacters?: number
  correctCharacters?: number
  errorCount?: number
  startTime?: number
  className?: string
  showDetailedStats?: boolean
}

interface TypingStats {
  wpm: number
  accuracy: number
  errors: number
  timeElapsed: number
  cpm: number // Characters per minute
  grossWpm: number // WPM including errors
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  isActive = false,
  totalCharacters = 0,
  correctCharacters = 0,
  errorCount = 0,
  startTime,
  className = '',
  showDetailedStats = false
}) => {
  const dispatch = useDispatch()
  const [currentTime, setCurrentTime] = useState(Date.now())

  // Update time every second when active
  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive])

  // Calculate performance metrics
  const calculateStats = (): TypingStats => {
    const timeElapsed = startTime ? (currentTime - startTime) / 1000 : 0
    const timeInMinutes = Math.max(timeElapsed / 60, 1/60) // Minimum 1 second
    
    // WPM calculation (standard: 1 word = 5 characters)
    const grossWpm = Math.round((totalCharacters / 5) / timeInMinutes)
    const wpm = Math.round((correctCharacters / 5) / timeInMinutes)
    
    // CPM calculation
    const cpm = Math.round(totalCharacters / timeInMinutes)
    
    // Accuracy calculation
    const accuracy = totalCharacters > 0 ? Math.round((correctCharacters / totalCharacters) * 100) : 100
    
    return {
      wpm: Math.max(0, wpm),
      grossWpm: Math.max(0, grossWpm),
      accuracy: Math.max(0, Math.min(100, accuracy)),
      errors: errorCount,
      timeElapsed: Math.round(timeElapsed),
      cpm: Math.max(0, cpm)
    }
  }

  const stats = calculateStats()

  // Update Redux store with current metrics
  useEffect(() => {
    if (isActive && totalCharacters > 0) {
      dispatch(updateCurrentSession({
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        errorCount: stats.errors
      }))
    }
  }, [stats.wpm, stats.accuracy, stats.errors, isActive, totalCharacters, dispatch])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getAccuracyColor = (accuracy: number): string => {
    if (accuracy >= 95) return 'text-green-600'
    if (accuracy >= 85) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getWpmColor = (wpm: number): string => {
    if (wpm >= 60) return 'text-green-600'
    if (wpm >= 40) return 'text-blue-600'
    if (wpm >= 20) return 'text-yellow-600'
    return 'text-gray-600'
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      {/* Main Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* WPM */}
        <div className="performance-metric text-center">
          <div className={`text-3xl font-bold ${getWpmColor(stats.wpm)}`}>
            {stats.wpm}
          </div>
          <div className="text-sm text-gray-600">WPM</div>
          <div className="text-xs text-gray-500">
            Words/min
          </div>
        </div>

        {/* Accuracy */}
        <div className="performance-metric text-center">
          <div className={`text-3xl font-bold ${getAccuracyColor(stats.accuracy)}`}>
            {stats.accuracy}%
          </div>
          <div className="text-sm text-gray-600">Accuracy</div>
          <div className="text-xs text-gray-500">
            {correctCharacters}/{totalCharacters}
          </div>
        </div>

        {/* Time */}
        <div className="performance-metric text-center">
          <div className="text-3xl font-bold text-blue-600">
            {formatTime(stats.timeElapsed)}
          </div>
          <div className="text-sm text-gray-600">Time</div>
          <div className="text-xs text-gray-500">
            {isActive ? 'Running' : 'Elapsed'}
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      {showDetailedStats && (
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="text-center">
              <div className="font-semibold text-gray-900">{stats.errors}</div>
              <div className="text-gray-600">Errors</div>
            </div>
            
            <div className="text-center">
              <div className="font-semibold text-gray-900">{stats.cpm}</div>
              <div className="text-gray-600">CPM</div>
            </div>
            
            <div className="text-center">
              <div className="font-semibold text-gray-900">{stats.grossWpm}</div>
              <div className="text-gray-600">Gross WPM</div>
            </div>
            
            <div className="text-center">
              <div className="font-semibold text-gray-900">
                {totalCharacters > 0 ? Math.round(((totalCharacters - stats.errors) / totalCharacters) * 100) : 100}%
              </div>
              <div className="text-gray-600">Net Accuracy</div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Indicators */}
      <div className="mt-4 flex justify-between items-center text-xs">
        {/* WPM Rating */}
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">Level:</span>
          <span className={`font-medium ${getWpmColor(stats.wpm)}`}>
            {stats.wpm >= 60 ? 'Expert' :
             stats.wpm >= 40 ? 'Advanced' :
             stats.wpm >= 20 ? 'Intermediate' :
             'Beginner'}
          </span>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          <span className="text-gray-500">
            {isActive ? 'Active' : 'Paused'}
          </span>
        </div>
      </div>

      {/* Progress Visualization */}
      {totalCharacters > 0 && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{correctCharacters}/{totalCharacters} chars</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="relative bg-blue-600 h-2 rounded-full transition-all duration-300"
                 style={{ width: `${(correctCharacters / totalCharacters) * 100}%` }}>
              {/* Error overlay */}
              {stats.errors > 0 && (
                <div className="absolute right-0 top-0 h-full bg-red-400 rounded-r-full"
                     style={{ width: `${(stats.errors / correctCharacters) * 100}%` }} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PerformanceMetrics