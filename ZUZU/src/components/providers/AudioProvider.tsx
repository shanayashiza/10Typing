import React, { createContext, useContext, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store'
import { updateAudioConfig } from '../../store/slices/settingsSlice'

interface AudioContextType {
  playButtonSound: () => void
  playTypingSound: () => void
  playSuccessSound: () => void
  playErrorSound: () => void
  playBackgroundMusic: () => void
  stopBackgroundMusic: () => void
  setVolume: (volume: number) => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export const useAudio = () => {
  const context = useContext(AudioContext)
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider')
  }
  return context
}

interface AudioProviderProps {
  children: React.ReactNode
}

const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const dispatch = useDispatch()
  const { audio } = useSelector((state: RootState) => state.settings)
  
  // Audio refs
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null)
  const buttonSoundRef = useRef<HTMLAudioElement | null>(null)
  const typingSoundRef = useRef<HTMLAudioElement | null>(null)
  const successSoundRef = useRef<HTMLAudioElement | null>(null)
  const errorSoundRef = useRef<HTMLAudioElement | null>(null)

  // Initialize audio elements
  useEffect(() => {
    // Create audio elements (you would replace these with actual audio files)
    backgroundMusicRef.current = new Audio('/audio/background-music.mp3')
    buttonSoundRef.current = new Audio('/audio/button-click.mp3')
    typingSoundRef.current = new Audio('/audio/typing-sound.mp3')
    successSoundRef.current = new Audio('/audio/success.mp3')
    errorSoundRef.current = new Audio('/audio/error.mp3')

    // Configure background music
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.loop = true
      backgroundMusicRef.current.volume = audio.volume / 100
    }

    // Configure other sounds
    const audioElements = [
      buttonSoundRef.current,
      typingSoundRef.current,
      successSoundRef.current,
      errorSoundRef.current,
    ]

    audioElements.forEach(audio => {
      if (audio) {
        audio.volume = audio.volume / 100
        audio.preload = 'auto'
      }
    })

    return () => {
      // Cleanup
      audioElements.forEach(audio => {
        if (audio) {
          audio.pause()
          audio.remove()
        }
      })
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause()
        backgroundMusicRef.current.remove()
      }
    }
  }, [])

  // Update volume when settings change
  useEffect(() => {
    const volume = audio.volume / 100
    
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.volume = volume
    }
    
    const audioElements = [
      buttonSoundRef.current,
      typingSoundRef.current,
      successSoundRef.current,
      errorSoundRef.current,
    ]
    
    audioElements.forEach(audioElement => {
      if (audioElement) {
        audioElement.volume = volume
      }
    })
  }, [audio.volume])

  const playButtonSound = () => {
    if (audio.buttonSounds && buttonSoundRef.current) {
      buttonSoundRef.current.currentTime = 0
      buttonSoundRef.current.play().catch(console.error)
    }
  }

  const playTypingSound = () => {
    if (audio.typingSounds && typingSoundRef.current) {
      typingSoundRef.current.currentTime = 0
      typingSoundRef.current.play().catch(console.error)
    }
  }

  const playSuccessSound = () => {
    if (audio.gameEffects && successSoundRef.current) {
      successSoundRef.current.currentTime = 0
      successSoundRef.current.play().catch(console.error)
    }
  }

  const playErrorSound = () => {
    if (audio.gameEffects && errorSoundRef.current) {
      errorSoundRef.current.currentTime = 0
      errorSoundRef.current.play().catch(console.error)
    }
  }

  const playBackgroundMusic = () => {
    if (audio.backgroundMusic && backgroundMusicRef.current) {
      backgroundMusicRef.current.play().catch(console.error)
    }
  }

  const stopBackgroundMusic = () => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause()
      backgroundMusicRef.current.currentTime = 0
    }
  }

  const setVolume = (volume: number) => {
    dispatch(updateAudioConfig({ volume }))
  }

  const value: AudioContextType = {
    playButtonSound,
    playTypingSound,
    playSuccessSound,
    playErrorSound,
    playBackgroundMusic,
    stopBackgroundMusic,
    setVolume,
  }

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  )
}

export default AudioProvider