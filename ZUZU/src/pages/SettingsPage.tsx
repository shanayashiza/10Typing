import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { RootState } from '../store'
import { setLanguage, updateAudioConfig, setShowVirtualKeyboard, setShowFingerGuide } from '../store/slices/settingsSlice'
import { useLanguage } from '../components/providers/LanguageProvider'
import { useAudio } from '../components/providers/AudioProvider'

const SettingsPage: React.FC = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { changeLanguage } = useLanguage()
  const { playButtonSound } = useAudio()
  
  const { language, audio, showVirtualKeyboard, showFingerGuide } = useSelector((state: RootState) => state.settings)

  const handleLanguageChange = (newLanguage: 'id' | 'en') => {
    playButtonSound()
    changeLanguage(newLanguage)
    dispatch(setLanguage(newLanguage))
  }

  const handleAudioToggle = (setting: keyof typeof audio) => {
    playButtonSound()
    dispatch(updateAudioConfig({ [setting]: !audio[setting] }))
  }

  const handleVolumeChange = (volume: number) => {
    dispatch(updateAudioConfig({ volume }))
  }

  const handleDisplayToggle = (setting: 'virtualKeyboard' | 'fingerGuide') => {
    playButtonSound()
    if (setting === 'virtualKeyboard') {
      dispatch(setShowVirtualKeyboard(!showVirtualKeyboard))
    } else {
      dispatch(setShowFingerGuide(!showFingerGuide))
    }
  }

  return (
    <div className="space-y-6">
      {/* Language Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">{t('settings.language')}</h2>
        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="language"
              checked={language === 'id'}
              onChange={() => handleLanguageChange('id')}
              className="text-blue-600"
            />
            <span className="text-lg">🇮🇩</span>
            <span>Bahasa Indonesia</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="language"
              checked={language === 'en'}
              onChange={() => handleLanguageChange('en')}
              className="text-blue-600"
            />
            <span className="text-lg">🇺🇸</span>
            <span>English</span>
          </label>
        </div>
      </div>

      {/* Audio Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">{t('settings.audio')}</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>{t('settings.backgroundMusic')}</span>
            <button
              onClick={() => handleAudioToggle('backgroundMusic')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                audio.backgroundMusic ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  audio.backgroundMusic ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <span>{t('settings.buttonSounds')}</span>
            <button
              onClick={() => handleAudioToggle('buttonSounds')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                audio.buttonSounds ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  audio.buttonSounds ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span>{t('settings.typingSounds')}</span>
            <button
              onClick={() => handleAudioToggle('typingSounds')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                audio.typingSounds ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  audio.typingSounds ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span>{t('settings.gameEffects')}</span>
            <button
              onClick={() => handleAudioToggle('gameEffects')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                audio.gameEffects ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  audio.gameEffects ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span>{t('settings.volume')}</span>
              <span className="text-sm text-gray-500">{audio.volume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={audio.volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Display Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Display Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>{t('settings.virtualKeyboard')}</span>
            <button
              onClick={() => handleDisplayToggle('virtualKeyboard')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showVirtualKeyboard ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showVirtualKeyboard ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <span>{t('settings.fingerGuide')}</span>
            <button
              onClick={() => handleDisplayToggle('fingerGuide')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showFingerGuide ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showFingerGuide ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="bg-white rounded-lg shadow p-6">
        <button
          onClick={() => playButtonSound()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
        >
          {t('common.save')} Settings
        </button>
      </div>
    </div>
  )
}

export default SettingsPage