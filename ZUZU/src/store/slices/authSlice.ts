import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: any | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  session: null,
  loading: true,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload
      state.loading = false
      state.error = null
    },
    setSession: (state, action: PayloadAction<any | null>) => {
      state.session = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },
    clearAuth: (state) => {
      state.user = null
      state.session = null
      state.loading = false
      state.error = null
    },
  },
})

export const { setUser, setSession, setLoading, setError, clearAuth } = authSlice.actions
export default authSlice.reducer