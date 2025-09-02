import React, { createContext, useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store'
import { setLanguage } from '../../store/slices/settingsSlice'

interface LanguageContextType {
  language: 'id' | 'en'
  changeLanguage: (lang: 'id' | 'en') => void
  t: (key: string, options?: any) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

interface LanguageProviderProps {
  children: React.ReactNode
}

const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const { language } = useSelector((state: RootState) => state.settings)

  const changeLanguage = async (lang: 'id' | 'en') => {
    try {
      await i18n.changeLanguage(lang)
      dispatch(setLanguage(lang))
      
      // Save to localStorage
      localStorage.setItem('preferred-language', lang)
    } catch (error) {
      console.error('Failed to change language:', error)
    }
  }

  useEffect(() => {
    // Load language preference from localStorage on mount
    const savedLanguage = localStorage.getItem('preferred-language') as 'id' | 'en'
    if (savedLanguage && savedLanguage !== language) {
      changeLanguage(savedLanguage)
    }
  }, [])

  useEffect(() => {
    // Update i18n when Redux state changes
    if (i18n.language !== language) {
      i18n.changeLanguage(language)
    }
  }, [language, i18n])

  const value: LanguageContextType = {
    language,
    changeLanguage,
    t,
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export default LanguageProvider