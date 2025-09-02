import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { supabase } from './lib/supabase'
import { setUser, setSession, setLoading } from './store/slices/authSlice'
import { RootState } from './store'

// Components
import AuthProvider from './components/providers/AuthProvider'
import LanguageProvider from './components/providers/LanguageProvider'
import AudioProvider from './components/providers/AudioProvider'
import Layout from './components/layout/Layout'
import LoginPage from './pages/auth/LoginPage'
import Dashboard from './pages/Dashboard'
import LearningMode from './pages/learning/LearningMode'
import GameMode from './pages/games/GameMode'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useSelector((state: RootState) => state.auth)
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  return user ? <>{children}</> : <Navigate to="/auth" replace />
}

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useSelector((state: RootState) => state.auth)
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>
}

function App() {
  const dispatch = useDispatch()
  const { i18n } = useTranslation()
  const { language } = useSelector((state: RootState) => state.settings)

  useEffect(() => {
    // Initialize authentication state
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
        } else {
          dispatch(setSession(session))
          dispatch(setUser(session?.user ?? null))
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error)
      } finally {
        dispatch(setLoading(false))
      }
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        dispatch(setSession(session))
        dispatch(setUser(session?.user ?? null))
        dispatch(setLoading(false))
      }
    )

    initializeAuth()

    return () => subscription?.unsubscribe()
  }, [dispatch])

  // Update i18n language when Redux state changes
  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language)
    }
  }, [language, i18n])

  return (
    <AuthProvider>
      <LanguageProvider>
        <AudioProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/auth" 
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                } 
              />
              
              {/* Protected Routes */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="learning/*" element={<LearningMode />} />
                <Route path="games/*" element={<GameMode />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </AudioProvider>
      </LanguageProvider>
    </AuthProvider>
  )
}

export default App