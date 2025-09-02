import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import progressSlice from './slices/progressSlice'
import settingsSlice from './slices/settingsSlice'
import performanceSlice from './slices/performanceSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    progress: progressSlice,
    settings: settingsSlice,
    performance: performanceSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch