import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface PerformanceMetrics {
  wpm: number
  accuracy: number
  errorCount: number
  completionTime: number
  mode: 'learning' | 'game'
  modeDetail: string // Level name or game name
}

interface PerformanceSession extends PerformanceMetrics {
  id: string
  timestamp: string
  userId?: string
}

interface PerformanceState {
  currentSession: Partial<PerformanceMetrics>
  sessionHistory: PerformanceSession[]
  bestWpm: number
  bestAccuracy: number
  totalSessionsPlayed: number
  averageWpm: number
  averageAccuracy: number
}

const initialState: PerformanceState = {
  currentSession: {},
  sessionHistory: [],
  bestWpm: 0,
  bestAccuracy: 0,
  totalSessionsPlayed: 0,
  averageWpm: 0,
  averageAccuracy: 0,
}

const performanceSlice = createSlice({
  name: 'performance',
  initialState,
  reducers: {
    updateCurrentSession: (state, action: PayloadAction<Partial<PerformanceMetrics>>) => {
      state.currentSession = { ...state.currentSession, ...action.payload }
    },
    completeSession: (state, action: PayloadAction<PerformanceMetrics>) => {
      const session: PerformanceSession = {
        ...action.payload,
        id: `session_${Date.now()}`,
        timestamp: new Date().toISOString(),
      }
      
      state.sessionHistory.push(session)
      state.totalSessionsPlayed += 1
      
      // Update best scores
      if (session.wpm > state.bestWpm) {
        state.bestWpm = session.wpm
      }
      if (session.accuracy > state.bestAccuracy) {
        state.bestAccuracy = session.accuracy
      }
      
      // Calculate averages
      const totalWpm = state.sessionHistory.reduce((sum, s) => sum + s.wpm, 0)
      const totalAccuracy = state.sessionHistory.reduce((sum, s) => sum + s.accuracy, 0)
      
      state.averageWpm = Math.round(totalWpm / state.sessionHistory.length)
      state.averageAccuracy = Math.round(totalAccuracy / state.sessionHistory.length)
      
      // Reset current session
      state.currentSession = {}
    },
    clearCurrentSession: (state) => {
      state.currentSession = {}
    },
    resetPerformanceData: (state) => {
      Object.assign(state, initialState)
    },
    loadSessionHistory: (state, action: PayloadAction<PerformanceSession[]>) => {
      state.sessionHistory = action.payload
      
      // Recalculate statistics
      if (action.payload.length > 0) {
        state.totalSessionsPlayed = action.payload.length
        state.bestWpm = Math.max(...action.payload.map(s => s.wpm))
        state.bestAccuracy = Math.max(...action.payload.map(s => s.accuracy))
        
        const totalWpm = action.payload.reduce((sum, s) => sum + s.wpm, 0)
        const totalAccuracy = action.payload.reduce((sum, s) => sum + s.accuracy, 0)
        
        state.averageWpm = Math.round(totalWpm / action.payload.length)
        state.averageAccuracy = Math.round(totalAccuracy / action.payload.length)
      }
    },
  },
})

export const {
  updateCurrentSession,
  completeSession,
  clearCurrentSession,
  resetPerformanceData,
  loadSessionHistory,
} = performanceSlice.actions

export default performanceSlice.reducer