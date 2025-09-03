import React, { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

interface TypingAreaProps {
  text: string
  onCharacterTyped?: (char: string, isCorrect: boolean) => void
  onComplete?: () => void
  onError?: (errorCount: number) => void
  className?: string
  disabled?: boolean
  showCursor?: boolean
}

interface CharacterState {
  char: string
  status: 'pending' | 'correct' | 'incorrect' | 'current'
  index: number
}

const TypingArea: React.FC<TypingAreaProps> = ({
  text,
  onCharacterTyped,
  onComplete,
  onError,
  className = '',
  disabled = false,
  showCursor = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [typedText, setTypedText] = useState('')
  const [errors, setErrors] = useState<number[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const textAreaRef = useRef<HTMLDivElement>(null)

  // Focus management
  useEffect(() => {
    if (textAreaRef.current && !disabled) {
      textAreaRef.current.focus()
    }
  }, [disabled])

  // Reset when text changes
  useEffect(() => {
    resetTyping()
  }, [text])

  const resetTyping = () => {
    setCurrentIndex(0)
    setTypedText('')
    setErrors([])
    setIsComplete(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || isComplete) return

    const key = e.key

    // Prevent default browser shortcuts
    if (e.ctrlKey || e.altKey || e.metaKey) {
      return
    }

    e.preventDefault()

    // Handle backspace
    if (key === 'Backspace') {
      if (currentIndex > 0) {
        const newIndex = currentIndex - 1
        setCurrentIndex(newIndex)
        setTypedText(typedText.slice(0, -1))
        
        // Remove error if we're backspacing over an error
        setErrors(errors.filter(errorIndex => errorIndex !== newIndex))
      }
      return
    }

    // Handle regular character input
    if (key.length === 1 && currentIndex < text.length) {
      const expectedChar = text[currentIndex]
      const isCorrect = key === expectedChar
      
      // Update typed text
      const newTypedText = typedText + key
      setTypedText(newTypedText)
      
      // Update errors
      let newErrors = [...errors]
      if (!isCorrect) {
        newErrors.push(currentIndex)
        setErrors(newErrors)
      }
      
      // Move to next character
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      
      // Callbacks
      onCharacterTyped?.(key, isCorrect)
      onError?.(newErrors.length)
      
      // Check for completion
      if (newIndex >= text.length) {
        setIsComplete(true)
        onComplete?.()
      }
    }
  }

  const renderCharacter = (char: string, index: number) => {
    let status: CharacterState['status'] = 'pending'
    
    if (index < currentIndex) {
      status = errors.includes(index) ? 'incorrect' : 'correct'
    } else if (index === currentIndex) {
      status = 'current'
    }

    const getCharacterClass = () => {
      const baseClass = 'inline-block'
      
      switch (status) {
        case 'correct':
          return `${baseClass} bg-green-100 text-green-800`
        case 'incorrect':
          return `${baseClass} bg-red-100 text-red-800`
        case 'current':
          return `${baseClass} bg-blue-200 text-blue-900 ${showCursor ? 'animate-pulse' : ''}`
        default:
          return `${baseClass} text-gray-700`
      }
    }

    // Handle space character display
    const displayChar = char === ' ' ? '␣' : char

    return (
      <span
        key={index}
        className={getCharacterClass()}
        style={{ 
          minWidth: char === ' ' ? '0.5em' : 'auto',
          borderRadius: '2px',
          padding: '0 1px'
        }}
      >
        {displayChar}
      </span>
    )
  }

  const calculateStats = () => {
    const totalTyped = currentIndex
    const correctChars = totalTyped - errors.length
    const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100
    
    return {
      totalTyped,
      correctChars,
      errors: errors.length,
      accuracy,
      progress: Math.round((currentIndex / text.length) * 100)
    }
  }

  const stats = calculateStats()

  return (
    <div className={`${className}`}>
      {/* Text Display Area */}
      <div
        ref={textAreaRef}
        className="typing-text p-6 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none cursor-text min-h-[200px]"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        style={{ 
          fontSize: '1.25rem',
          lineHeight: '1.8',
          fontFamily: 'JetBrains Mono, monospace'
        }}
      >
        {text.split('').map((char, index) => renderCharacter(char, index))}
        
        {/* Cursor */}
        {showCursor && currentIndex < text.length && (
          <span className="inline-block w-0.5 h-6 bg-blue-600 animate-pulse ml-0.5" />
        )}
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            Progress: {currentIndex}/{text.length} characters
          </span>
          <span className="text-sm text-gray-600">
            {stats.progress}% complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${stats.progress}%` }}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 flex justify-between items-center text-sm">
        <div className="flex space-x-4">
          <span className="text-gray-600">
            Accuracy: <span className="font-medium text-green-600">{stats.accuracy}%</span>
          </span>
          <span className="text-gray-600">
            Errors: <span className="font-medium text-red-600">{stats.errors}</span>
          </span>
        </div>
        
        {isComplete && (
          <div className="flex items-center space-x-2 text-green-600">
            <span className="text-xl">✓</span>
            <span className="font-medium">Completed!</span>
          </div>
        )}
      </div>

      {/* Instructions */}
      {!disabled && currentIndex === 0 && (
        <div className="mt-4 text-sm text-gray-500 text-center">
          Click here and start typing. Use backspace to correct mistakes.
        </div>
      )}
    </div>
  )
}

export default TypingArea