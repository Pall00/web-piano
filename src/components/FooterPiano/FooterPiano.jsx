import { useRef, useState, useEffect } from 'react'
import {
  PianoContainer,
  WhiteKeysContainer,
  WhiteKey,
  BlackKey,
  KeyLabel,
  StartAudioButton,
  LoadingIndicator,
} from './FooterPiano.styles'
import { generatePianoKeys, calculateBlackKeyPosition } from './utils/pianoUtils'
import usePianoAudio from './hooks/usePianoAudio'

const FooterPiano = ({ showLabels = false }) => {
  // Piano keys data
  const pianoKeys = generatePianoKeys()
  const whiteKeys = pianoKeys.filter(key => !key.isBlack)
  const blackKeys = pianoKeys.filter(key => key.isBlack)

  // Refs and state for dimensions
  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(0)

  // Piano audio hook
  const { isAudioStarted, isLoaded, startAudio, playNote, stopNote } = usePianoAudio()

  // Mouse press tracking
  const [activeNotes, setActiveNotes] = useState(new Set())

  // Handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Calculate key dimensions
  const whiteKeyWidth = Math.max(containerWidth / whiteKeys.length, 20)
  const blackKeyWidth = whiteKeyWidth * 0.65

  // Handle key press
  const handleKeyDown = note => {
    if (!activeNotes.has(note)) {
      const newActiveNotes = new Set(activeNotes)
      newActiveNotes.add(note)
      setActiveNotes(newActiveNotes)

      // Play the note
      playNote(note)
    }
  }

  // Handle key release
  const handleKeyUp = note => {
    if (activeNotes.has(note)) {
      const newActiveNotes = new Set(activeNotes)
      newActiveNotes.delete(note)
      setActiveNotes(newActiveNotes)

      // Stop the note
      stopNote(note)
    }
  }

  // Show start button if audio not started
  if (!isAudioStarted) {
    return (
      <PianoContainer ref={containerRef}>
        <StartAudioButton onClick={startAudio}>Click to Start Piano</StartAudioButton>
      </PianoContainer>
    )
  }

  // Show loading indicator while samples are loading
  if (!isLoaded) {
    return (
      <PianoContainer ref={containerRef}>
        <LoadingIndicator>
          <div className="spinner"></div>
          <div>Loading Piano Samples...</div>
        </LoadingIndicator>
      </PianoContainer>
    )
  }

  return (
    <PianoContainer ref={containerRef}>
      <WhiteKeysContainer>
        {/* White keys */}
        {whiteKeys.map(key => (
          <WhiteKey
            key={key.note}
            $width={whiteKeyWidth}
            $active={activeNotes.has(key.note)}
            onMouseDown={() => handleKeyDown(key.note)}
            onMouseUp={() => handleKeyUp(key.note)}
            onMouseLeave={() => handleKeyUp(key.note)}
            onTouchStart={() => handleKeyDown(key.note)}
            onTouchEnd={() => handleKeyUp(key.note)}
          >
            <KeyLabel $isBlack={false} $showLabels={showLabels}>
              {key.note}
            </KeyLabel>
          </WhiteKey>
        ))}

        {/* Black keys */}
        {blackKeys.map(key => (
          <BlackKey
            key={key.note}
            $width={blackKeyWidth}
            $position={
              calculateBlackKeyPosition(key.note, whiteKeys, whiteKeyWidth) - blackKeyWidth / 2
            }
            $active={activeNotes.has(key.note)}
            onMouseDown={() => handleKeyDown(key.note)}
            onMouseUp={() => handleKeyUp(key.note)}
            onMouseLeave={() => handleKeyUp(key.note)}
            onTouchStart={() => handleKeyDown(key.note)}
            onTouchEnd={() => handleKeyUp(key.note)}
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
