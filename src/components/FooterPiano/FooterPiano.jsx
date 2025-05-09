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
  SustainIndicator,
} from './FooterPiano.styles'
import { generatePianoKeys, calculateBlackKeyPosition } from './utils/pianoUtils'
import usePianoAudio from './hooks/usePianoAudio'
import useMidiKeyboard from './hooks/useMidiKeyboard'
import { setPianoInstance } from '../../utils/PianoBridge'
import logger from '../../utils/logger'

// Configure logger for piano interaction events
logger.configure({
  throttleMs: 200, // Higher throttling for piano UI events
  sampleRate: 10, // Only log 1 out of every 10 events
})

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

  // ==========================================
  // Keyboard Interaction Logic (from old piano)
  // ==========================================

  // Mouse state tracking
  const [mouseIsDown, setMouseIsDown] = useState(false)

  // Track touched notes using a Set for efficient lookups
  const [touchedNotes, setTouchedNotes] = useState(new Set())

  // Piano audio hook
  const { isAudioStarted, isLoaded, isSustainActive, startAudio, setSustain, playNote, stopNote } =
    usePianoAudio()

  // Is audio fully ready to play?
  const isAudioReady = isAudioStarted && isLoaded

  // Check if a note is being touched
  const isTouched = useCallback(
    note => {
      return touchedNotes.has(note)
    },
    [touchedNotes],
  )

  // Get a stable function to check if a note is active
  const isNoteActive = useCallback(
    note => {
      // A note is active if it's being touched
      return isTouched(note)
    },
    [isTouched],
  )

  // Mouse event handlers
  const handleMouseDown = useCallback(
    note => {
      setMouseIsDown(true)
      setTouchedNotes(prev => {
        const newSet = new Set(prev)
        newSet.add(note)
        return newSet
      })
      playNote(note)
      logger.debug(() => `Key down: ${note} (mouse)`)

      // Notify listeners about the note being pressed by the user
      if (window.pianoEvents) {
        window.pianoEvents.notify({
          note,
          action: 'pressed',
          source: 'user',
        })
      }
    },
    [playNote],
  )

  const handleMouseUp = useCallback(
    note => {
      setMouseIsDown(false)
      setTouchedNotes(prev => {
        const newSet = new Set(prev)
        newSet.delete(note)
        return newSet
      })

      if (!isSustainActive) {
        stopNote(note)
        logger.debug(() => `Key up: ${note} (mouse)`)
      }

      // Notify listeners about the note being released by the user
      if (window.pianoEvents) {
        window.pianoEvents.notify({
          note,
          action: 'released',
          source: 'user',
        })
      }
    },
    [isSustainActive, stopNote],
  )

  const handleMouseEnter = useCallback(
    note => {
      if (mouseIsDown) {
        setTouchedNotes(prev => {
          const newSet = new Set(prev)
          newSet.add(note)
          return newSet
        })
        playNote(note)
        logger.debug(() => `Mouse enter key: ${note}`)

        // Notify listeners about the note being pressed by the user
        if (window.pianoEvents) {
          window.pianoEvents.notify({
            note,
            action: 'pressed',
            source: 'user',
          })
        }
      }
    },
    [mouseIsDown, playNote],
  )

  const handleMouseLeave = useCallback(
    note => {
      if (mouseIsDown && !isSustainActive) {
        setTouchedNotes(prev => {
          const newSet = new Set(prev)
          newSet.delete(note)
          return newSet
        })
        stopNote(note)
        logger.debug(() => `Mouse leave key: ${note}`)

        // Notify listeners about the note being released by the user
        if (window.pianoEvents) {
          window.pianoEvents.notify({
            note,
            action: 'released',
            source: 'user',
          })
        }
      }
    },
    [mouseIsDown, isSustainActive, stopNote],
  )

  // Touch event handlers
  const handleTouchStart = useCallback(
    note => {
      setTouchedNotes(prev => {
        const newSet = new Set(prev)
        newSet.add(note)
        return newSet
      })
      playNote(note)
      logger.debug(() => `Touch start: ${note}`)

      // Notify listeners about the note being pressed by the user
      if (window.pianoEvents) {
        window.pianoEvents.notify({
          note,
          action: 'pressed',
          source: 'user',
        })
      }
    },
    [playNote],
  )

  const handleTouchEnd = useCallback(
    note => {
      setTouchedNotes(prev => {
        const newSet = new Set(prev)
        newSet.delete(note)
        return newSet
      })
      if (!isSustainActive) {
        stopNote(note)
        logger.debug(() => `Touch end: ${note}`)
      }

      // Notify listeners about the note being released by the user
      if (window.pianoEvents) {
        window.pianoEvents.notify({
          note,
          action: 'released',
          source: 'user',
        })
      }
    },
    [isSustainActive, stopNote],
  )

  // Global mouse up handler to reset state when mouse is released anywhere
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (mouseIsDown) {
        setMouseIsDown(false)

        // If sustain is not active, release all notes that were being pressed via mouse
        if (!isSustainActive) {
          // Convert Set to Array to avoid modification during iteration
          const notesToRelease = Array.from(touchedNotes)

          // Clear touched notes first
          setTouchedNotes(new Set())

          // Stop all notes that were being touched
          notesToRelease.forEach(note => {
            stopNote(note)
            logger.debug(() => `Global mouse up: releasing ${note}`)

            // Notify listeners about notes being released by the user
            if (window.pianoEvents) {
              window.pianoEvents.notify({
                note,
                action: 'released',
                source: 'user',
              })
            }
          })
        } else {
          // Just clear the touched notes without stopping them (sustain is on)
          setTouchedNotes(new Set())
        }
      }
    }

    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [mouseIsDown, touchedNotes, isSustainActive, stopNote])

  // MIDI keyboard hook - initialized with our note handlers and audio ready state
  const { isMidiConnected, midiDeviceName, initializeMidi } = useMidiKeyboard({
    onNoteOn: note => {
      setTouchedNotes(prev => {
        const newSet = new Set(prev)
        newSet.add(note)
        return newSet
      })
      playNote(note)
      // Note: No need to log here - already logged in useMidiKeyboard

      // Notify listeners about the note being pressed by the user (via MIDI)
      if (window.pianoEvents) {
        window.pianoEvents.notify({
          note,
          action: 'pressed',
          source: 'user',
        })
      }
    },
    onNoteOff: note => {
      setTouchedNotes(prev => {
        const newSet = new Set(prev)
        newSet.delete(note)
        return newSet
      })
      if (!isSustainActive) {
        stopNote(note)
        // Note: No need to log here - already logged in useMidiKeyboard
      }

      // Notify listeners about the note being released by the user (via MIDI)
      if (window.pianoEvents) {
        window.pianoEvents.notify({
          note,
          action: 'released',
          source: 'user',
        })
      }
    },
    onSustainChange: isActive => setSustain(isActive),
    isAudioReady: isAudioReady,
  })

  // Register the piano with the PianoBridge utility for external control
  useEffect(() => {
    // Register this piano instance with the bridge
    setPianoInstance({
      // Flag to indicate if this piano uses 's' for sharps instead of '#'
      useSharpS: true, // Set to true if your piano uses 's' instead of '#' for sharps

      playNote: noteId => {
        if (!noteId) return

        try {
          // Just use the note as-is
          logger.debug(() => `Piano bridge playing note: ${noteId}`)
          playNote(noteId)
        } catch (err) {
          logger.error(`Error playing note ${noteId}: ${err.message}`)
        }
      },

      highlightNote: noteId => {
        if (!noteId) return

        try {
          // Add note to touched notes to highlight it (without playing)
          setTouchedNotes(prev => {
            const newSet = new Set(prev)
            newSet.add(noteId)
            return newSet
          })

          // Remove highlight after a short delay
          setTimeout(() => {
            setTouchedNotes(prev => {
              const newSet = new Set(prev)
              newSet.delete(noteId)
              return newSet
            })
          }, 500)
        } catch (err) {
          logger.error(`Error highlighting note ${noteId}: ${err.message}`)
        }
      },
    })

    // Clean up when component unmounts
    return () => {
      setPianoInstance(null)
    }
  }, [playNote]) // Add playNote as a dependency

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
      logger.info('Audio is fully loaded, initializing MIDI...')
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
      logger.info('Audio started, waiting for samples to load before MIDI initialization...')
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
          <SustainIndicator className={isSustainActive ? 'active' : ''}>Sustain</SustainIndicator>
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
              $active={isNoteActive(key.note)}
              onMouseDown={() => handleMouseDown(key.note)}
              onMouseUp={() => handleMouseUp(key.note)}
              onMouseEnter={() => handleMouseEnter(key.note)}
              onMouseLeave={() => handleMouseLeave(key.note)}
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
              $active={isNoteActive(key.note)}
              onMouseDown={() => handleMouseDown(key.note)}
              onMouseUp={() => handleMouseUp(key.note)}
              onMouseEnter={() => handleMouseEnter(key.note)}
              onMouseLeave={() => handleMouseLeave(key.note)}
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
