import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Database types based on our schema design
export interface User {
  id_user: string
  email: string
  nama_pengguna: string
  foto_profil_url?: string
  bahasa_pilihan: 'id' | 'en'
  created_at: string
  updated_at: string
}

export interface KemajuanBelajar {
  id_kemajuan: string
  id_user: string
  level_utama: number
  sublevel_terakhir: number
  persentase_selesai: number
  waktu_update_terakhir: string
}

