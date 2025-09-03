-- 10Types Typing Game Database Schema
-- This file contains the SQL commands to set up the database structure in Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for profile and preferences
CREATE TABLE IF NOT EXISTS users (
    id_user UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nama_pengguna VARCHAR(100) NOT NULL,
    foto_profil_url TEXT,
    bahasa_pilihan VARCHAR(5) DEFAULT 'id' CHECK (bahasa_pilihan IN ('id', 'en')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning progress tracking
CREATE TABLE IF NOT EXISTS kemajuan_belajar (
    id_kemajuan UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_user UUID REFERENCES users(id_user) ON DELETE CASCADE,
    level_utama INTEGER NOT NULL CHECK (level_utama >= 1 AND level_utama <= 5),
    sublevel_terakhir INTEGER NOT NULL CHECK (sublevel_terakhir >= 1 AND sublevel_terakhir <= 20),
    persentase_selesai DECIMAL(5,2) DEFAULT 0.00 CHECK (persentase_selesai >= 0 AND persentase_selesai <= 100),
    waktu_update_terakhir TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(id_user)
);

-- Performance history for each typing session
CREATE TABLE IF NOT EXISTS riwayat_performa (
    id_sesi UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_user UUID REFERENCES users(id_user) ON DELETE CASCADE,
    mode VARCHAR(10) NOT NULL CHECK (mode IN ('belajar', 'game')),
    detail_mode VARCHAR(100) NOT NULL, -- Level name or game name
    wpm INTEGER NOT NULL DEFAULT 0,
    akurasi DECIMAL(5,2) NOT NULL DEFAULT 0.00 CHECK (akurasi >= 0 AND akurasi <= 100),
    jumlah_kesalahan INTEGER NOT NULL DEFAULT 0,
    waktu_selesai TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    durasi_detik INTEGER DEFAULT 0
);

-- Sublevel completion tracking (for detailed progress)
CREATE TABLE IF NOT EXISTS sublevel_selesai (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_user UUID REFERENCES users(id_user) ON DELETE CASCADE,
    level_utama INTEGER NOT NULL CHECK (level_utama >= 1 AND level_utama <= 5),
    sublevel INTEGER NOT NULL CHECK (sublevel >= 1 AND sublevel <= 20),
    wpm_terbaik INTEGER DEFAULT 0,
    akurasi_terbaik DECIMAL(5,2) DEFAULT 0.00,
    waktu_selesai TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(id_user, level_utama, sublevel)
);

-- Multi-tenant support for organizations (future feature)
CREATE TABLE IF NOT EXISTS konten_multi_tenant (
    id_tenant UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_organisasi VARCHAR(200) NOT NULL,
    admin_email VARCHAR(255) NOT NULL,
    fitur_tambahan JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements system
CREATE TABLE IF NOT EXISTS pencapaian (
    id_pencapaian UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_user UUID REFERENCES users(id_user) ON DELETE CASCADE,
    nama_pencapaian VARCHAR(100) NOT NULL,
    deskripsi TEXT,
    kategori VARCHAR(50) DEFAULT 'general',
    waktu_dicapai TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_kemajuan_user ON kemajuan_belajar(id_user);
CREATE INDEX IF NOT EXISTS idx_riwayat_user ON riwayat_performa(id_user);
CREATE INDEX IF NOT EXISTS idx_riwayat_mode ON riwayat_performa(mode);
CREATE INDEX IF NOT EXISTS idx_sublevel_user ON sublevel_selesai(id_user);
CREATE INDEX IF NOT EXISTS idx_pencapaian_user ON pencapaian(id_user);

-- RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE kemajuan_belajar ENABLE ROW LEVEL SECURITY;
ALTER TABLE riwayat_performa ENABLE ROW LEVEL SECURITY;
ALTER TABLE sublevel_selesai ENABLE ROW LEVEL SECURITY;
ALTER TABLE pencapaian ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id_user);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id_user);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id_user);

CREATE POLICY "Users can view own progress" ON kemajuan_belajar FOR SELECT USING (auth.uid() = id_user);
CREATE POLICY "Users can update own progress" ON kemajuan_belajar FOR UPDATE USING (auth.uid() = id_user);
CREATE POLICY "Users can insert own progress" ON kemajuan_belajar FOR INSERT WITH CHECK (auth.uid() = id_user);

CREATE POLICY "Users can view own performance" ON riwayat_performa FOR SELECT USING (auth.uid() = id_user);
CREATE POLICY "Users can insert own performance" ON riwayat_performa FOR INSERT WITH CHECK (auth.uid() = id_user);

CREATE POLICY "Users can view own sublevel progress" ON sublevel_selesai FOR SELECT USING (auth.uid() = id_user);
CREATE POLICY "Users can update own sublevel progress" ON sublevel_selesai FOR UPDATE USING (auth.uid() = id_user);
CREATE POLICY "Users can insert own sublevel progress" ON sublevel_selesai FOR INSERT WITH CHECK (auth.uid() = id_user);

CREATE POLICY "Users can view own achievements" ON pencapaian FOR SELECT USING (auth.uid() = id_user);
CREATE POLICY "Users can insert own achievements" ON pencapaian FOR INSERT WITH CHECK (auth.uid() = id_user);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kemajuan_updated_at BEFORE UPDATE ON kemajuan_belajar
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();