import { supabase } from '../lib/supabase'
import type { 
  User, 
} from '../lib/supabase'

// User Profile Services
export const userService = {
  // Get user profile by ID
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id_user', userId)
      .single()
    
    if (error) throw error
    return data
  },

  // Create user profile
  async createProfile(userId: string, email: string, username: string, language: 'id' | 'en' = 'id') {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id_user: userId,
        email,
        nama_pengguna: username,
        bahasa_pilihan: language,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update user profile
  async updateProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id_user', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },
}

// Progress Tracking Services
export const progressService = {
  // Get user's learning progress
  async getProgress(userId: string) {
    const { data, error } = await supabase
      .from('kemajuan_belajar')
      .select('*')
      .eq('id_user', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Initialize user progress
  async initializeProgress(userId: string) {
    const { data, error } = await supabase
      .from('kemajuan_belajar')
      .insert({
        id_user: userId,
        level_utama: 1,
        sublevel_terakhir: 1,
        persentase_selesai: 0,
        waktu_update_terakhir: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update progress
  async updateProgress(userId: string, level: number, sublevel: number, percentage: number) {
    const { data, error } = await supabase
      .from('kemajuan_belajar')
      .upsert({
        id_user: userId,
        level_utama: level,
        sublevel_terakhir: sublevel,
        persentase_selesai: percentage,
        waktu_update_terakhir: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get completed sublevels
  async getCompletedSublevels(userId: string) {
    const { data, error } = await supabase
      .from('sublevel_selesai')
      .select('*')
      .eq('id_user', userId)
      .order('level_utama', { ascending: true })
      .order('sublevel', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  // Mark sublevel as completed
  async completeSublevel(
    userId: string, 
    level: number, 
    sublevel: number, 
    wpm: number, 
    accuracy: number
  ) {
    const { data, error } = await supabase
      .from('sublevel_selesai')
      .upsert({
        id_user: userId,
        level_utama: level,
        sublevel: sublevel,
        wpm_terbaik: wpm,
        akurasi_terbaik: accuracy,
        waktu_selesai: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },
}

// Performance Tracking Services
export const performanceService = {
  // Save typing session performance
  async saveSession(sessionData: {
    userId: string
    mode: 'belajar' | 'game'
    detailMode: string
    wpm: number
    accuracy: number
    errorCount: number
    duration: number
  }) {
    const { data, error } = await supabase
      .from('riwayat_performa')
      .insert({
        id_user: sessionData.userId,
        mode: sessionData.mode,
        detail_mode: sessionData.detailMode,
        wpm: sessionData.wpm,
        akurasi: sessionData.accuracy,
        jumlah_kesalahan: sessionData.errorCount,
        durasi_detik: sessionData.duration,
        waktu_selesai: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get user's performance history
  async getPerformanceHistory(userId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from('riwayat_performa')
      .select('*')
      .eq('id_user', userId)
      .order('waktu_selesai', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  },

  // Get performance statistics
  async getPerformanceStats(userId: string) {
    const { data, error } = await supabase
      .from('riwayat_performa')
      .select('wpm, akurasi, jumlah_kesalahan')
      .eq('id_user', userId)
    
    if (error) throw error
    
    if (!data || data.length === 0) {
      return {
        bestWpm: 0,
        averageWpm: 0,
        bestAccuracy: 0,
        averageAccuracy: 0,
        totalSessions: 0
      }
    }

    const wpmValues = data.map(session => session.wpm)
    const accuracyValues = data.map(session => session.akurasi)

    return {
      bestWpm: Math.max(...wpmValues),
      averageWpm: Math.round(wpmValues.reduce((sum, wpm) => sum + wpm, 0) / wpmValues.length),
      bestAccuracy: Math.max(...accuracyValues),
      averageAccuracy: Math.round(accuracyValues.reduce((sum, acc) => sum + acc, 0) / accuracyValues.length),
      totalSessions: data.length
    }
  },

  // Get performance by mode (learning vs games)
  async getPerformanceByMode(userId: string, mode: 'belajar' | 'game') {
    const { data, error } = await supabase
      .from('riwayat_performa')
      .select('*')
      .eq('id_user', userId)
      .eq('mode', mode)
      .order('waktu_selesai', { ascending: false })
    
    if (error) throw error
    return data || []
  },
}

// Achievement Services
export const achievementService = {
  // Get user achievements
  async getUserAchievements(userId: string) {
    const { data, error } = await supabase
      .from('pencapaian')
      .select('*')
      .eq('id_user', userId)
      .order('waktu_dicapai', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Award achievement to user
  async awardAchievement(
    userId: string, 
    name: string, 
    description: string, 
    category: string = 'general'
  ) {
    // Check if user already has this achievement
    const { data: existing } = await supabase
      .from('pencapaian')
      .select('id_pencapaian')
      .eq('id_user', userId)
      .eq('nama_pencapaian', name)
      .single()

    if (existing) {
      return existing // Already has this achievement
    }

    const { data, error } = await supabase
      .from('pencapaian')
      .insert({
        id_user: userId,
        nama_pencapaian: name,
        deskripsi: description,
        kategori: category,
        waktu_dicapai: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },
}

// Combined service for dashboard data
export const dashboardService = {
  // Get all dashboard data in one call
  async getDashboardData(userId: string) {
    const [profile, progress, completedSublevels, performanceStats, recentSessions] = await Promise.all([
      userService.getProfile(userId),
      progressService.getProgress(userId),
      progressService.getCompletedSublevels(userId),
      performanceService.getPerformanceStats(userId),
      performanceService.getPerformanceHistory(userId, 10)
    ])

    return {
      profile,
      progress,
      completedSublevels,
      performanceStats,
      recentSessions
    }
  },

}
