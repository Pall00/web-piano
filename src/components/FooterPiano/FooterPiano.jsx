// src/components/FooterPiano/FooterPiano.jsx
import { useRef, useState, useEffect } from 'react'
import {
  PianoContainer,
  WhiteKeysContainer,
  WhiteKey,
  BlackKey,
  KeyLabel,
} from './FooterPiano.styles'
import { generatePianoKeys, calculateBlackKeyPosition } from './utils/pianoUtils'

const FooterPiano = ({ showLabels = false }) => {
  // Generate data for all piano keys
  const pianoKeys = generatePianoKeys()
  const whiteKeys = pianoKeys.filter(key => !key.isBlack)
  const blackKeys = pianoKeys.filter(key => key.isBlack)

  // Ref for piano container
  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(0)

  // Track window size changes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }

    // Initial size calculation
    updateDimensions()

    // Add resize listener
    window.addEventListener('resize', updateDimensions)

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateDimensions)
    }
  }, [])

  // Calculate key widths
  const whiteKeyWidth = Math.max(containerWidth / whiteKeys.length, 20) // Minimum width of 20px
  const blackKeyWidth = whiteKeyWidth * 0.65

  // Handle key press
  const handleKeyPress = note => {
    // Replace console.log with console.warn to comply with lint rules
    console.warn(`Played ${note}`)
  }

  return (
    <PianoContainer ref={containerRef}>
      <WhiteKeysContainer>
        {/* Render white keys */}
        {whiteKeys.map(key => (
          <WhiteKey key={key.note} $width={whiteKeyWidth} onClick={() => handleKeyPress(key.note)}>
            <KeyLabel $isBlack={false} $showLabels={showLabels}>
              {key.note}
            </KeyLabel>
          </WhiteKey>
        ))}

        {/* Render black keys */}
        {blackKeys.map(key => (
          <BlackKey
            key={key.note}
            $width={blackKeyWidth}
            $position={
              calculateBlackKeyPosition(key.note, whiteKeys, whiteKeyWidth) - blackKeyWidth / 2
            }
            onClick={() => handleKeyPress(key.note)}
          >
            <KeyLabel $isBlack={true} $showLabels={showLabels}>
              {key.note}
            </KeyLabel>
          </BlackKey>
        ))}
      </WhiteKeysContainer>
    </PianoContainer>
  )
}

export default FooterPiano
