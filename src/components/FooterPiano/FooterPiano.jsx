// src/components/FooterPiano/FooterPiano.jsx

import { useRef, useState, useEffect, useCallback } from 'react'
import {
  PianoContainer,
  PianoUpperHousing,
  PianoFeltStrip,
  ControlsContainer,
  WhiteKeysContainer,
  WhiteKey,
  BlackKey,
  KeyLabel,
  NoteName,
  OctaveNumber,
  StartAudioButton,
  LoadingIndicator,
  MidiIndicator,
} from './FooterPiano.styles'
import { generatePianoKeys, calculateBlackKeyPosition } from './utils/pianoUtils'
import usePianoAudio from './hooks/usePianoAudio'
import useMidiKeyboard from './hooks/useMidiKeyboard'

const FooterPiano = () => {
  // Piano keys data
  const pianoKeys = generatePianoKeys()
  const whiteKeys = pianoKeys.filter(key => !key.isBlack)
  const blackKeys = pianoKeys.filter(key => key.isBlack)

  // Refs and state for dimensions
  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(0)

  // MIDI initialization ref to prevent duplicate initializations
  const midiInitializedRef = useRef(false)

  // Mouse press tracking - using an array for more reliable updates with multiple notes
  const [activeNotes, setActiveNotes] = useState([])

  // Keep a reference to the active notes to avoid closure issues
  const activeNotesRef = useRef(activeNotes)

  // Update the ref whenever activeNotes changes
  useEffect(() => {
    activeNotesRef.current = activeNotes
  }, [activeNotes])

  // Piano audio hook
  const { isAudioStarted, isLoaded, startAudio, playNote, stopNote } = usePianoAudio()

  // Is audio fully ready to play?
  const isAudioReady = isAudioStarted && isLoaded

  // Handle key press with useCallback to maintain stable reference
  const handleKeyDown = useCallback(
    (note, source = 'mouse') => {
      // Don't check the state from the closure - use the ref for latest value
      if (!activeNotesRef.current.includes(note)) {
        setActiveNotes(prevNotes => [...prevNotes, note])
        playNote(note)
        console.warn(`Key down: ${note} (${source})`)
      }
    },
    [playNote],
  )

  // Handle key release with useCallback to maintain stable reference
  const handleKeyUp = useCallback(
    (note, source = 'mouse') => {
      // Don't check the state from the closure - use the ref for latest value
      if (activeNotesRef.current.includes(note)) {
        setActiveNotes(prevNotes => prevNotes.filter(n => n !== note))
        stopNote(note)
        console.warn(`Key up: ${note} (${source})`)
      }
    },
    [stopNote],
  )

  // Mouse event handlers for the piano keys
  const handleMouseDown = useCallback(
    note => {
      handleKeyDown(note, 'mouse')
    },
    [handleKeyDown],
  )

  const handleMouseUp = useCallback(
    note => {
      handleKeyUp(note, 'mouse')
    },
    [handleKeyUp],
  )

  const handleTouchStart = useCallback(
    note => {
      handleKeyDown(note, 'touch')
    },
    [handleKeyDown],
  )

  const handleTouchEnd = useCallback(
    note => {
      handleKeyUp(note, 'touch')
    },
    [handleKeyUp],
  )

  // MIDI keyboard hook - initialized with our note handlers and audio ready state
  const { isMidiConnected, midiDeviceName, initializeMidi } = useMidiKeyboard({
    onNoteOn: note => handleKeyDown(note, 'midi'),
    onNoteOff: note => handleKeyUp(note, 'midi'),
    isAudioReady: isAudioReady,
  })

  // Check if connected to a Port-1 device
  const isPort1Device =
    midiDeviceName &&
    (midiDeviceName.toLowerCase().includes('port 1') ||
      midiDeviceName.toLowerCase().includes('port1') ||
      midiDeviceName.toLowerCase().includes('midi 1') ||
      midiDeviceName.toLowerCase().includes('midi1'))

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

  // Initialize MIDI when audio is fully loaded
  useEffect(() => {
    // Only initialize once when audio becomes ready
    if (isAudioReady && !midiInitializedRef.current) {
      console.warn('Audio is fully loaded, initializing MIDI...')
      midiInitializedRef.current = true
      initializeMidi()
    }
  }, [isAudioReady, initializeMidi])

  // Calculate key dimensions
  const whiteKeyWidth = Math.max(containerWidth / whiteKeys.length, 20)
  const blackKeyWidth = whiteKeyWidth * 0.65

  // Combined function to start audio and MIDI
  const handleStartAudio = async () => {
    const audioStarted = await startAudio()
    if (audioStarted) {
      // We'll initialize MIDI in the useEffect when audio is fully loaded
      console.warn('Audio started, waiting for samples to load before MIDI initialization...')
      // Not calling initializeMidi() here as we'll do it in the useEffect when isLoaded becomes true
    }
    return audioStarted
  }

  // Show start button if audio not started
  if (!isAudioStarted) {
    return (
      <PianoContainer ref={containerRef}>
        <StartAudioButton onClick={handleStartAudio}>Click to Start Piano</StartAudioButton>
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

  // Helper function to split the note into noteName and octave
  const splitNote = note => {
    // Extract note and octave (e.g. "C4" -> "C" and "4")
    const noteMatch = note.match(/^([A-G][#]?)(\d+)$/)
    if (noteMatch) {
      return {
        noteName: noteMatch[1],
        octave: noteMatch[2],
      }
    }
    return { noteName: note, octave: '' }
  }

  return (
    <PianoContainer ref={containerRef}>
      <PianoUpperHousing>
        <PianoFeltStrip />
        <ControlsContainer>
          {isMidiConnected && (
            <MidiIndicator $isPort1={isPort1Device}>MIDI: {midiDeviceName}</MidiIndicator>
          )}
          {/* Future controls would go here */}
        </ControlsContainer>
      </PianoUpperHousing>

      <WhiteKeysContainer>
        {/* White keys */}
        {whiteKeys.map(key => {
          const { noteName, octave } = splitNote(key.note)
          return (
            <WhiteKey
              key={key.note}
              $width={whiteKeyWidth}
              $active={activeNotes.includes(key.note)}
              onMouseDown={() => handleMouseDown(key.note)}
              onMouseUp={() => handleMouseUp(key.note)}
              onMouseLeave={() => handleMouseUp(key.note)}
              onTouchStart={() => handleTouchStart(key.note)}
              onTouchEnd={() => handleTouchEnd(key.note)}
            >
              <KeyLabel $isBlack={false}>
                <NoteName $isBlack={false}>{noteName}</NoteName>
                <OctaveNumber $isBlack={false}>{octave}</OctaveNumber>
              </KeyLabel>
            </WhiteKey>
          )
        })}

        {/* Black keys */}
        {blackKeys.map(key => {
          const { noteName, octave } = splitNote(key.note)
          return (
            <BlackKey
              key={key.note}
              $width={blackKeyWidth}
              $position={
                calculateBlackKeyPosition(key.note, whiteKeys, whiteKeyWidth) - blackKeyWidth / 2
              }
              $active={activeNotes.includes(key.note)}
              onMouseDown={() => handleMouseDown(key.note)}
              onMouseUp={() => handleMouseUp(key.note)}
              onMouseLeave={() => handleMouseUp(key.note)}
              onTouchStart={() => handleTouchStart(key.note)}
              onTouchEnd={() => handleTouchEnd(key.note)}
            >
              <KeyLabel $isBlack={true}>
                <NoteName $isBlack={true}>{noteName}</NoteName>
                <OctaveNumber $isBlack={true}>{octave}</OctaveNumber>
              </KeyLabel>
            </BlackKey>
          )
        })}
      </WhiteKeysContainer>
    </PianoContainer>
  )
}

export default FooterPiano
