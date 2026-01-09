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
  throttleMs: 200,
  sampleRate: 10,
})

const FooterPiano = () => {
  const pianoKeys = generatePianoKeys()
  const whiteKeys = pianoKeys.filter(key => !key.isBlack)
  const blackKeys = pianoKeys.filter(key => key.isBlack)

  const containerRef = useRef(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const midiInitializedRef = useRef(false)

  // Keyboard Interaction Logic
  const [mouseIsDown, setMouseIsDown] = useState(false)
  const [touchedNotes, setTouchedNotes] = useState(new Set())

  // UUSI: Pysyvä tila opastusnuoteille (nämä eivät katoa timeoutilla)
  const [guidanceNotes, setGuidanceNotes] = useState(new Set())

  const { isAudioStarted, isLoaded, isSustainActive, startAudio, setSustain, playNote, stopNote } =
    usePianoAudio()

  const isAudioReady = isAudioStarted && isLoaded

  const isTouched = useCallback(
    note => {
      return touchedNotes.has(note)
    },
    [touchedNotes],
  )

  // PÄIVITETTY: Nuotti on aktiivinen jos käyttäjä koskee TAI jos se on opastuksessa
  const isNoteActive = useCallback(
    note => {
      return touchedNotes.has(note) || guidanceNotes.has(note)
    },
    [touchedNotes, guidanceNotes],
  )

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

  const handleTouchStart = useCallback(
    note => {
      setTouchedNotes(prev => {
        const newSet = new Set(prev)
        newSet.add(note)
        return newSet
      })
      playNote(note)
      logger.debug(() => `Touch start: ${note}`)

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

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (mouseIsDown) {
        setMouseIsDown(false)
        if (!isSustainActive) {
          const notesToRelease = Array.from(touchedNotes)
          setTouchedNotes(new Set())
          notesToRelease.forEach(note => {
            stopNote(note)
            if (window.pianoEvents) {
              window.pianoEvents.notify({
                note,
                action: 'released',
                source: 'user',
              })
            }
          })
        } else {
          setTouchedNotes(new Set())
        }
      }
    }

    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [mouseIsDown, touchedNotes, isSustainActive, stopNote])

  const { isMidiConnected, midiDeviceName, initializeMidi } = useMidiKeyboard({
    onNoteOn: note => {
      setTouchedNotes(prev => {
        const newSet = new Set(prev)
        newSet.add(note)
        return newSet
      })
      playNote(note)
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
      }
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

  // Register bridge
  useEffect(() => {
    setPianoInstance({
      useSharpS: true,

      playNote: noteId => {
        if (!noteId) return
        try {
          playNote(noteId)
        } catch (err) {
          logger.error(`Error playing note ${noteId}: ${err.message}`)
        }
      },

      // Vanha toiminto (vilkutus), jätetään taaksepäin yhteensopivuuden vuoksi
      highlightNote: noteId => {
        if (!noteId) return
        try {
          setTouchedNotes(prev => {
            const newSet = new Set(prev)
            newSet.add(noteId)
            return newSet
          })
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

      // UUSI: Asettaa pysyvät opastusnuotit
      setGuidanceNotes: notes => {
        try {
          if (!notes || !Array.isArray(notes)) {
            setGuidanceNotes(new Set())
            return
          }
          setGuidanceNotes(new Set(notes))
        } catch (err) {
          logger.error('Error setting guidance notes:', err)
        }
      },
    })

    return () => {
      setPianoInstance(null)
    }
  }, [playNote])

  const isPort1Device =
    midiDeviceName &&
    (midiDeviceName.toLowerCase().includes('port 1') ||
      midiDeviceName.toLowerCase().includes('port1') ||
      midiDeviceName.toLowerCase().includes('midi 1') ||
      midiDeviceName.toLowerCase().includes('midi1'))

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

  useEffect(() => {
    if (isAudioReady && !midiInitializedRef.current) {
      logger.info('Audio is fully loaded, initializing MIDI...')
      midiInitializedRef.current = true
      initializeMidi()
    }
  }, [isAudioReady, initializeMidi])

  const whiteKeyWidth = Math.max(containerWidth / whiteKeys.length, 20)
  const blackKeyWidth = whiteKeyWidth * 0.65

  const handleStartAudio = async () => {
    const audioStarted = await startAudio()
    return audioStarted
  }

  if (!isAudioStarted) {
    return (
      <PianoContainer ref={containerRef}>
        <StartAudioButton onClick={handleStartAudio}>Click to Start Piano</StartAudioButton>
      </PianoContainer>
    )
  }

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

  const splitNote = note => {
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
        </ControlsContainer>
      </PianoUpperHousing>

      <WhiteKeysContainer>
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
                <NoteName $isBlack={false} $active={isNoteActive(key.note)}>
                  {noteName}
                </NoteName>
                <OctaveNumber $isBlack={false} $active={isNoteActive(key.note)}>
                  {octave}
                </OctaveNumber>
              </KeyLabel>
            </WhiteKey>
          )
        })}

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
                <NoteName $isBlack={true} $active={isNoteActive(key.note)}>
                  {noteName}
                </NoteName>
                <OctaveNumber $isBlack={true} $active={isNoteActive(key.note)}>
                  {octave}
                </OctaveNumber>
              </KeyLabel>
            </BlackKey>
          )
        })}
      </WhiteKeysContainer>
    </PianoContainer>
  )
}

export default FooterPiano
