import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

interface VirtualKeyboardProps {
  currentChar?: string
  pressedKeys?: Set<string>
  showFingerGuide?: boolean
  className?: string
}

// Keyboard layout with finger assignments
const keyboardLayout = [
  // Number row
  [
    { key: '`', finger: 'left-pinky', shift: '~' },
    { key: '1', finger: 'left-pinky', shift: '!' },
    { key: '2', finger: 'left-ring', shift: '@' },
    { key: '3', finger: 'left-middle', shift: '#' },
    { key: '4', finger: 'left-index', shift: '$' },
    { key: '5', finger: 'left-index', shift: '%' },
    { key: '6', finger: 'right-index', shift: '^' },
    { key: '7', finger: 'right-index', shift: '&' },
    { key: '8', finger: 'right-middle', shift: '*' },
    { key: '9', finger: 'right-ring', shift: '(' },
    { key: '0', finger: 'right-pinky', shift: ')' },
    { key: '-', finger: 'right-pinky', shift: '_' },
    { key: '=', finger: 'right-pinky', shift: '+' },
  ],
  // Top row (QWERTY)
  [
    { key: 'q', finger: 'left-pinky' },
    { key: 'w', finger: 'left-ring' },
    { key: 'e', finger: 'left-middle' },
    { key: 'r', finger: 'left-index' },
    { key: 't', finger: 'left-index' },
    { key: 'y', finger: 'right-index' },
    { key: 'u', finger: 'right-index' },
    { key: 'i', finger: 'right-middle' },
    { key: 'o', finger: 'right-ring' },
    { key: 'p', finger: 'right-pinky' },
    { key: '[', finger: 'right-pinky', shift: '{' },
    { key: ']', finger: 'right-pinky', shift: '}' },
    { key: '\\', finger: 'right-pinky', shift: '|' },
  ],
  // Home row (ASDF)
  [
    { key: 'a', finger: 'left-pinky', isHome: true },
    { key: 's', finger: 'left-ring', isHome: true },
    { key: 'd', finger: 'left-middle', isHome: true },
    { key: 'f', finger: 'left-index', isHome: true },
    { key: 'g', finger: 'left-index' },
    { key: 'h', finger: 'right-index' },
    { key: 'j', finger: 'right-index', isHome: true },
    { key: 'k', finger: 'right-middle', isHome: true },
    { key: 'l', finger: 'right-ring', isHome: true },
    { key: ';', finger: 'right-pinky', isHome: true, shift: ':' },
    { key: "'", finger: 'right-pinky', shift: '"' },
  ],
  // Bottom row (ZXCV)
  [
    { key: 'z', finger: 'left-pinky' },
    { key: 'x', finger: 'left-ring' },
    { key: 'c', finger: 'left-middle' },
    { key: 'v', finger: 'left-index' },
    { key: 'b', finger: 'left-index' },
    { key: 'n', finger: 'right-index' },
    { key: 'm', finger: 'right-index' },
    { key: ',', finger: 'right-middle', shift: '<' },
    { key: '.', finger: 'right-ring', shift: '>' },
    { key: '/', finger: 'right-pinky', shift: '?' },
  ],
]

// Finger color mapping for visual guidance
const fingerColors = {
  'left-pinky': 'bg-red-200 border-red-400',
  'left-ring': 'bg-orange-200 border-orange-400',
  'left-middle': 'bg-yellow-200 border-yellow-400',
  'left-index': 'bg-green-200 border-green-400',
  'right-index': 'bg-blue-200 border-blue-400',
  'right-middle': 'bg-indigo-200 border-indigo-400',
  'right-ring': 'bg-purple-200 border-purple-400',
  'right-pinky': 'bg-pink-200 border-pink-400',
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  currentChar = '',
  pressedKeys = new Set(),
  showFingerGuide = true,
  className = ''
}) => {
  const { showVirtualKeyboard, showFingerGuide: showGuideFromSettings } = useSelector((state: RootState) => state.settings)

  if (!showVirtualKeyboard) return null

  const shouldShowFingerGuide = showFingerGuide && showGuideFromSettings

  const getKeyClass = (keyData: any) => {
    const baseClass = 'virtual-key'
    const isActive = pressedKeys.has(keyData.key) || keyData.key.toLowerCase() === currentChar.toLowerCase()
    const isHome = keyData.isHome
    const fingerColor = shouldShowFingerGuide ? fingerColors[keyData.finger as keyof typeof fingerColors] : ''

    let classes = [baseClass]
    
    if (isActive) {
      classes.push('active')
    } else if (isHome) {
      classes.push('border-2 border-blue-300 bg-blue-50')
    } else if (shouldShowFingerGuide) {
      classes.push(fingerColor)
    } else {
      classes.push('bg-white border-gray-300')
    }

    return classes.join(' ')
  }

  const getKeyDisplay = (keyData: any) => {
    if (keyData.shift) {
      return (
        <div className="flex flex-col items-center text-xs">
          <span className="text-gray-600">{keyData.shift}</span>
          <span className="font-medium">{keyData.key.toUpperCase()}</span>
        </div>
      )
    }
    return keyData.key.toUpperCase()
  }

  return (
    <div className={`bg-gray-100 rounded-lg p-4 select-none ${className}`}>
      {/* Keyboard Layout */}
      <div className="space-y-2">
        {keyboardLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center space-x-1">
            {/* Left side modifiers for certain rows */}
            {rowIndex === 2 && (
              <div className="virtual-key w-16 text-xs bg-gray-300 border-gray-400">
                CAPS
              </div>
            )}
            {rowIndex === 3 && (
              <div className="virtual-key w-20 text-xs bg-gray-300 border-gray-400">
                SHIFT
              </div>
            )}

            {/* Main keys */}
            {row.map((keyData, keyIndex) => (
              <div
                key={keyIndex}
                className={getKeyClass(keyData)}
                style={{ minWidth: '2.5rem' }}
              >
                {getKeyDisplay(keyData)}
              </div>
            ))}

            {/* Right side modifiers for certain rows */}
            {rowIndex === 1 && (
              <div className="virtual-key w-16 text-xs bg-gray-300 border-gray-400">
                BKSP
              </div>
            )}
            {rowIndex === 2 && (
              <div className="virtual-key w-16 text-xs bg-gray-300 border-gray-400">
                ENTER
              </div>
            )}
            {rowIndex === 3 && (
              <div className="virtual-key w-20 text-xs bg-gray-300 border-gray-400">
                SHIFT
              </div>
            )}
          </div>
        ))}

        {/* Space bar row */}
        <div className="flex justify-center space-x-1">
          <div className="virtual-key w-12 text-xs bg-gray-300 border-gray-400">
            CTRL
          </div>
          <div className="virtual-key w-12 text-xs bg-gray-300 border-gray-400">
            ALT
          </div>
          <div 
            className={`virtual-key text-xs bg-gray-300 border-gray-400 ${
              pressedKeys.has(' ') || currentChar === ' ' ? 'active' : ''
            }`}
            style={{ minWidth: '12rem' }}
          >
            SPACE
          </div>
          <div className="virtual-key w-12 text-xs bg-gray-300 border-gray-400">
            ALT
          </div>
          <div className="virtual-key w-12 text-xs bg-gray-300 border-gray-400">
            CTRL
          </div>
        </div>
      </div>

      {/* Finger Guide Legend */}
      {shouldShowFingerGuide && (
        <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-red-200 border border-red-400 rounded"></div>
            <span>Left Pinky</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-orange-200 border border-orange-400 rounded"></div>
            <span>Left Ring</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-yellow-200 border border-yellow-400 rounded"></div>
            <span>Left Middle</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-green-200 border border-green-400 rounded"></div>
            <span>Left Index</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-blue-200 border border-blue-400 rounded"></div>
            <span>Right Index</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-indigo-200 border border-indigo-400 rounded"></div>
            <span>Right Middle</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-purple-200 border border-purple-400 rounded"></div>
            <span>Right Ring</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-pink-200 border border-pink-400 rounded"></div>
            <span>Right Pinky</span>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-3 text-center text-sm text-gray-600">
        <p>Blue keys are home position. Follow the colored finger guides.</p>
      </div>
    </div>
  )
}

export default VirtualKeyboard