import React from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { RootState } from '../store'

const ProfilePage: React.FC = () => {
  const { t } = useTranslation()
  const { user } = useSelector((state: RootState) => state.auth)
  const { bestWpm, averageWpm, totalSessionsPlayed, bestAccuracy } = useSelector((state: RootState) => state.performance)
  const { totalProgress, currentLevel } = useSelector((state: RootState) => state.progress)

  const stats = [
    { label: t('performance.bestWpm'), value: bestWpm, icon: '⚡' },
    { label: t('performance.averageWpm'), value: averageWpm, icon: '📈' },
    { label: 'Best Accuracy', value: `${bestAccuracy}%`, icon: '🎯' },
    { label: t('performance.totalSessions'), value: totalSessionsPlayed, icon: '📊' },
  ]

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.email?.split('@')[0] || 'User'}
            </h1>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-sm text-gray-500">
              {t('dashboard.currentLevel')} {currentLevel} • {totalProgress}% Complete
            </p>
          </div>
        </div>
      </div>

      {/* Performance Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Performance Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="performance-metric text-center">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Chart Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Progress Over Time</h2>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">📈</div>
            <p className="text-gray-600">Performance chart coming soon!</p>
          </div>
        </div>
      </div>

      {/* Achievements Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['First Steps', 'Speed Demon', 'Accuracy Master'].map((achievement, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="text-2xl mb-2">🏆</div>
              <h3 className="font-medium text-gray-900">{achievement}</h3>
              <p className="text-sm text-gray-600">Achievement description</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage