import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { RootState } from '../store'
import { useAudio } from '../components/providers/AudioProvider'

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { playButtonSound } = useAudio()
  
  const { user } = useSelector((state: RootState) => state.auth)
  const { currentLevel, currentSublevel, totalProgress } = useSelector((state: RootState) => state.progress)
  const { bestWpm, averageWpm, totalSessionsPlayed } = useSelector((state: RootState) => state.performance)

  const username = user?.email?.split('@')[0] || 'User'

  useEffect(() => {
    // Load user progress from database here
    // This will be implemented when we set up the database connection
  }, [])

  const handleNavigation = (path: string) => {
    playButtonSound()
    navigate(path)
  }

  const quickActions = [
    {
      title: t('dashboard.startLearning'),
      description: `${t('learning.level')} ${currentLevel} - ${t('learning.sublevel')} ${currentSublevel}`,
      icon: '📚',
      color: 'bg-blue-500',
      action: () => handleNavigation('/learning'),
    },
    {
      title: t('dashboard.playGames'),
      description: 'Choose from 4 typing games',
      icon: '🎮',
      color: 'bg-purple-500',
      action: () => handleNavigation('/games'),
    },
    {
      title: t('dashboard.viewStats'),
      description: `${totalSessionsPlayed} sessions completed`,
      icon: '📊',
      color: 'bg-green-500',
      action: () => handleNavigation('/profile'),
    },
  ]

  const performanceStats = [
    {
      label: t('performance.bestWpm'),
      value: `${bestWpm}`,
      icon: '⚡',
      color: 'text-yellow-600',
    },
    {
      label: t('performance.averageWpm'),
      value: `${averageWpm}`,
      icon: '📈',
      color: 'text-blue-600',
    },
    {
      label: t('dashboard.completionRate'),
      value: `${totalProgress}%`,
      icon: '🎯',
      color: 'text-green-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          {t('dashboard.welcome', { username })}
        </h1>
        <p className="text-blue-100">
          Ready to improve your typing skills today?
        </p>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          {t('dashboard.progressOverview')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {performanceStats.map((stat, index) => (
            <div key={index} className="performance-metric">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-2xl ${stat.color}`}>{stat.icon}</span>
                <span className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </span>
              </div>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {t('dashboard.currentLevel')} {currentLevel}
            </span>
            <span className="text-sm text-gray-500">
              {totalProgress}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${totalProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          {t('dashboard.quickActions')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="game-card text-left"
            >
              <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl mb-4`}>
                {action.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {action.title}
              </h3>
              <p className="text-sm text-gray-600">
                {action.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity (Placeholder) */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">📝</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Completed Level {i} Lesson {i * 2}
                </p>
                <p className="text-xs text-gray-500">
                  {i} hours ago • {20 + i * 5} WPM • 9{5 - i}% accuracy
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard