import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AudioConfig {
  backgroundMusic: boolean
  buttonSounds: boolean
  typingSounds: boolean
  gameEffects: boolean
  volume: number // 0-100
}

interface SettingsState {
  language: 'id' | 'en'
  audio: AudioConfig
  theme: 'light' | 'dark'
  showVirtualKeyboard: boolean
  showFingerGuide: boolean
}

const initialState: SettingsState = {
  language: 'id', // Default to Indonesian
  audio: {
    backgroundMusic: true,
    buttonSounds: true,
    typingSounds: false,
    gameEffects: true,
    volume: 70,
  },
  theme: 'light',
  showVirtualKeyboard: true,
  showFingerGuide: true,
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<'id' | 'en'>) => {
      state.language = action.payload
    },
    updateAudioConfig: (state, action: PayloadAction<Partial<AudioConfig>>) => {
      state.audio = { ...state.audio, ...action.payload }
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
    },
    setShowVirtualKeyboard: (state, action: PayloadAction<boolean>) => {
      state.showVirtualKeyboard = action.payload
    },
    setShowFingerGuide: (state, action: PayloadAction<boolean>) => {
      state.showFingerGuide = action.payload
    },
    resetSettings: (state) => {
      Object.assign(state, initialState)
    },
  },
})

export const {
  setLanguage,
  updateAudioConfig,
  setTheme,
  setShowVirtualKeyboard,
  setShowFingerGuide,
  resetSettings,
} = settingsSlice.actions

export default settingsSlice.reducer