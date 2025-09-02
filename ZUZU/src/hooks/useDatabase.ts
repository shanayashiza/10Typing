import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { 
  userService, 
  progressService, 
  performanceService, 
  dashboardService,
  achievementService 
} from '../services/database'
import { 
  setCurrentLevel, 
  setCurrentSublevel, 
  completeSublevel 
} from '../store/slices/progressSlice'
import { 
  completeSession, 
  loadSessionHistory 
} from '../store/slices/performanceSlice'

// Hook for user profile data
export const useUserProfile = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      loadProfile()
    }
  }, [user?.id])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const profileData = await userService.getProfile(user!.id)
      setProfile(profileData)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: any) => {
    try {
      const updatedProfile = await userService.updateProfile(user!.id, updates)
      setProfile(updatedProfile)
      return updatedProfile
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: loadProfile
  }
}

// Hook for progress tracking
export const useProgress = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.auth)
  const { currentLevel, currentSublevel, completedSublevels, totalProgress } = useSelector((state: RootState) => state.progress)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      loadProgress()
    }
  }, [user?.id])

  const loadProgress = async () => {
    try {
      setLoading(true)
      const [progress, completedSublevels] = await Promise.all([
        progressService.getProgress(user!.id),
        progressService.getCompletedSublevels(user!.id)
      ])

      if (progress) {
        dispatch(setCurrentLevel(progress.level_utama))
        dispatch(setCurrentSublevel(progress.sublevel_terakhir))
      } else {
        // Initialize progress if not found
        await progressService.initializeProgress(user!.id)
      }

      // Load completed sublevels into Redux
      completedSublevels.forEach(sublevel => {
        dispatch(completeSublevel({
          level: sublevel.level_utama,
          sublevel: sublevel.sublevel
        }))
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateProgress = async (level: number, sublevel: number) => {
    try {
      const percentage = calculateProgressPercentage(level, sublevel, completedSublevels)
      await progressService.updateProgress(user!.id, level, sublevel, percentage)
      
      dispatch(setCurrentLevel(level))
      dispatch(setCurrentSublevel(sublevel))
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const markSublevelComplete = async (level: number, sublevel: number, wpm: number, accuracy: number) => {
    try {
      await progressService.completeSublevel(user!.id, level, sublevel, wpm, accuracy)
      
      dispatch(completeSublevel({ level, sublevel }))
      
      // Update overall progress
      const nextSublevel = sublevel < 20 ? sublevel + 1 : 1
      const nextLevel = sublevel < 20 ? level : Math.min(level + 1, 5)
      
      await updateProgress(nextLevel, nextSublevel)
      
      // Check for achievements
      await checkAndAwardAchievements(level, sublevel, wpm, accuracy)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  return {
    currentLevel,
    currentSublevel,
    completedSublevels,
    totalProgress,
    loading,
    error,
    updateProgress,
    markSublevelComplete,
    refetch: loadProgress
  }
}

// Hook for performance tracking
export const usePerformance = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state: RootState) => state.auth)
  const performance = useSelector((state: RootState) => state.performance)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      loadPerformanceData()
    }
  }, [user?.id])

  const loadPerformanceData = async () => {
    try {
      setLoading(true)
      const [history, stats] = await Promise.all([
        performanceService.getPerformanceHistory(user!.id),
        performanceService.getPerformanceStats(user!.id)
      ])

      dispatch(loadSessionHistory(history))
      // Update performance stats in Redux store
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const saveSession = async (sessionData: {
    mode: 'belajar' | 'game'
    detailMode: string
    wpm: number
    accuracy: number
    errorCount: number
    duration: number
  }) => {
    try {
      const session = await performanceService.saveSession({
        userId: user!.id,
        ...sessionData
      })

      dispatch(completeSession({
        wpm: sessionData.wpm,
        accuracy: sessionData.accuracy,
        errorCount: sessionData.errorCount,
        completionTime: sessionData.duration,
        mode: sessionData.mode === 'belajar' ? 'learning' : 'game',
        modeDetail: sessionData.detailMode
      }))

      return session
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  return {
    ...performance,
    loading,
    error,
    saveSession,
    refetch: loadPerformanceData
  }
}

// Hook for dashboard data
export const useDashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      loadDashboardData()
    }
  }, [user?.id])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const dashboardData = await dashboardService.getDashboardData(user!.id)
      setData(dashboardData)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    data,
    loading,
    error,
    refetch: loadDashboardData
  }
}

// Hook for achievements
export const useAchievements = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      loadAchievements()
    }
  }, [user?.id])

  const loadAchievements = async () => {
    try {
      setLoading(true)
      const achievementData = await achievementService.getUserAchievements(user!.id)
      setAchievements(achievementData)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    achievements,
    loading,
    error,
    refetch: loadAchievements
  }
}

// Utility functions
const calculateProgressPercentage = (level: number, sublevel: number, completedSublevels: Record<string, boolean>) => {
  const totalCompleted = Object.keys(completedSublevels).length
  return Math.round((totalCompleted / 100) * 100)
}

const checkAndAwardAchievements = async (level: number, sublevel: number, wpm: number, accuracy: number) => {
  // Achievement logic will be implemented here
  // Examples: First lesson completed, 50 WPM achieved, 95% accuracy, etc.
  
  // First lesson achievement
  if (level === 1 && sublevel === 1) {
    // Award "First Steps" achievement
  }
  
  // Speed achievements
  if (wpm >= 30) {
    // Award speed achievement
  }
  
  // Accuracy achievements
  if (accuracy >= 95) {
    // Award accuracy achievement
  }
}