import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ProgressState {
  currentLevel: number
  currentSublevel: number
  completedSublevels: Record<string, boolean> // Format: "level-sublevel"
  totalProgress: number // 0-100 percentage
  unlockedLevels: number[]
}

const initialState: ProgressState = {
  currentLevel: 1,
  currentSublevel: 1,
  completedSublevels: {},
  totalProgress: 0,
  unlockedLevels: [1], // Level 1 is unlocked by default
}

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    setCurrentLevel: (state, action: PayloadAction<number>) => {
      state.currentLevel = action.payload
    },
    setCurrentSublevel: (state, action: PayloadAction<number>) => {
      state.currentSublevel = action.payload
    },
    completeSublevel: (state, action: PayloadAction<{ level: number; sublevel: number }>) => {
      const { level, sublevel } = action.payload
      const key = `${level}-${sublevel}`
      state.completedSublevels[key] = true
      
      // Update total progress (5 levels × 20 sublevels = 100 total)
      const completedCount = Object.keys(state.completedSublevels).length
      state.totalProgress = Math.round((completedCount / 100) * 100)
      
      // Check if level should be unlocked
      const levelSublevels = Object.keys(state.completedSublevels)
        .filter(k => k.startsWith(`${level}-`))
      
      // If all sublevels of current level are complete, unlock next level
      if (levelSublevels.length === 20 && level < 5) {
        if (!state.unlockedLevels.includes(level + 1)) {
          state.unlockedLevels.push(level + 1)
        }
      }
    },
    unlockLevel: (state, action: PayloadAction<number>) => {
      if (!state.unlockedLevels.includes(action.payload)) {
        state.unlockedLevels.push(action.payload)
      }
    },
    resetProgress: (state) => {
      state.currentLevel = 1
      state.currentSublevel = 1
      state.completedSublevels = {}
      state.totalProgress = 0
      state.unlockedLevels = [1]
    },
  },
})

export const {
  setCurrentLevel,
  setCurrentSublevel,
  completeSublevel,
  unlockLevel,
  resetProgress,
} = progressSlice.actions

export default progressSlice.reducer