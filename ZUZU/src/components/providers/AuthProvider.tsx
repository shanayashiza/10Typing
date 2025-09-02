import React, { createContext, useContext, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { supabase, User as SupabaseUser } from '../../lib/supabase'
import { setUser, setLoading, setError, clearAuth } from '../../store/slices/authSlice'

interface AuthContextType {
  user: SupabaseUser | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
  signOut: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch()
  const [user, setUserState] = useState<SupabaseUser | null>(null)
  const [loading, setLoadingState] = useState(true)

  const signIn = async (email: string, password: string) => {
    try {
      dispatch(setLoading(true))
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        dispatch(setError(error.message))
        throw error
      }

      if (data.user) {
        // Check if user profile exists, create if not
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id_user', data.user.id)
          .single()

        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id_user: data.user.id,
              email: data.user.email!,
              nama_pengguna: data.user.email!.split('@')[0],
              bahasa_pilihan: 'id',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })

          if (insertError) {
            console.error('Error creating user profile:', insertError)
          }
        }
      }
    } catch (error) {
      throw error
    }
  }

  const signUp = async (email: string, password: string, username: string) => {
    try {
      dispatch(setLoading(true))
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      })

      if (error) {
        dispatch(setError(error.message))
        throw error
      }

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id_user: data.user.id,
            email: data.user.email!,
            nama_pengguna: username,
            bahasa_pilihan: 'id',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

        if (profileError) {
          console.error('Error creating user profile:', profileError)
        }

        // Initialize progress
        const { error: progressError } = await supabase
          .from('kemajuan_belajar')
          .insert({
            id_user: data.user.id,
            level_utama: 1,
            sublevel_terakhir: 1,
            persentase_selesai: 0,
            waktu_update_terakhir: new Date().toISOString(),
          })

        if (progressError) {
          console.error('Error creating initial progress:', progressError)
        }
      }
    } catch (error) {
      throw error
    }
  }

  const signOut = async () => {
    try {
      dispatch(setLoading(true))
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        dispatch(setError(error.message))
        throw error
      }
      
      dispatch(clearAuth())
      setUserState(null)
    } catch (error) {
      throw error
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUserState(session.user as SupabaseUser)
        dispatch(setUser(session.user))
      }
      
      setLoadingState(false)
      dispatch(setLoading(false))
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUserState(session.user as SupabaseUser)
          dispatch(setUser(session.user))
        } else {
          setUserState(null)
          dispatch(clearAuth())
        }
        
        setLoadingState(false)
        dispatch(setLoading(false))
      }
    )

    return () => subscription?.unsubscribe()
  }, [dispatch])

  const value: AuthContextType = {
    user,
    signIn,
    signUp,
    signOut,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider