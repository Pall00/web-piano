import { useState, useEffect, useCallback, useRef } from 'react'
import * as Tone from 'tone'

const usePianoAudio = () => {
  const [isAudioStarted, setIsAudioStarted] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [sampler, setSampler] = useState(null)
  const [isSustainActive, setIsSustainActive] = useState(false)

  // Track sustained notes and current sustain state with refs for immediate access
  const sustainedNotesRef = useRef(new Set())
  const sustainActiveRef = useRef(false) // Added ref for immediate access to sustain state

  // Initialize sampler after component mounts
  useEffect(() => {
    // Create a piano sampler using the Salamander Grand Piano samples
    const newSampler = new Tone.Sampler({
      urls: {
        // Just define key sample points - Tone.js will interpolate the rest
        A0: 'A0.mp3',
        C1: 'C1.mp3',
        'D#1': 'Ds1.mp3',
        'F#1': 'Fs1.mp3',
        A1: 'A1.mp3',
        C2: 'C2.mp3',
        'D#2': 'Ds2.mp3',
        'F#2': 'Fs2.mp3',
        A2: 'A2.mp3',
        C3: 'C3.mp3',
        'D#3': 'Ds3.mp3',
        'F#3': 'Fs3.mp3',
        A3: 'A3.mp3',
        C4: 'C4.mp3', // Middle C
        'D#4': 'Ds4.mp3',
        'F#4': 'Fs4.mp3',
        A4: 'A4.mp3',
        C5: 'C5.mp3',
        'D#5': 'Ds5.mp3',
        'F#5': 'Fs5.mp3',
        A5: 'A5.mp3',
        C6: 'C6.mp3',
        'D#6': 'Ds6.mp3',
        'F#6': 'Fs6.mp3',
        A6: 'A6.mp3',
        C7: 'C7.mp3',
        'D#7': 'Ds7.mp3',
        'F#7': 'Fs7.mp3',
        A7: 'A7.mp3',
        C8: 'C8.mp3',
      },
      release: 1,
      baseUrl: 'https://tonejs.github.io/audio/salamander/',
      onload: () => {
        setIsLoaded(true)
        console.warn('Piano samples loaded!')
      },
    }).toDestination()

    setSampler(newSampler)

    // Cleanup on unmount
    return () => {
      if (newSampler) {
        newSampler.dispose()
      }
    }
  }, [])

  // Start audio context (must be called after user gesture)
  const startAudio = useCallback(async () => {
    try {
      await Tone.start()
      setIsAudioStarted(true)
      return true
    } catch (error) {
      console.error('Could not start audio:', error)
      return false
    }
  }, [])

  // Play a note
  const playNote = useCallback(
    note => {
      if (sampler && isAudioStarted && isLoaded) {
        // If the note was in the sustained notes list, remove it
        // (because we're playing it again)
        if (sustainedNotesRef.current.has(note)) {
          sustainedNotesRef.current.delete(note)
        }

        // Play the note
        sampler.triggerAttack(note)
      }
    },
    [sampler, isAudioStarted, isLoaded],
  )

  // Stop a note
  const stopNote = useCallback(
    note => {
      if (!sampler || !isAudioStarted || !isLoaded) return

      // Check if sustain is active using the ref for immediate access
      if (sustainActiveRef.current) {
        // If sustain is active, add the note to the sustained notes list
        console.warn(`Sustaining note: ${note}`)
        sustainedNotesRef.current.add(note)
      } else {
        // If sustain is not active, release the note immediately
        console.warn(`Releasing note: ${note}`)
        sampler.triggerRelease(note)
      }
    },
    [sampler, isAudioStarted, isLoaded],
  )

  // Set sustain state
  const setSustain = useCallback(
    isActive => {
      // Update both the state (for UI) and the ref (for immediate access)
      setIsSustainActive(isActive)
      sustainActiveRef.current = isActive

      console.warn(`Sustain pedal: ${isActive ? 'ON' : 'OFF'}`)

      // When releasing the sustain pedal, release all sustained notes
      if (!isActive && sustainedNotesRef.current.size > 0) {
        if (sampler && isAudioStarted && isLoaded) {
          const notesToRelease = Array.from(sustainedNotesRef.current)
          console.warn('Releasing sustained notes:', notesToRelease)

          // Release all sustained notes using Tone.js
          sampler.triggerRelease(notesToRelease)

          // Clear the sustained notes set
          sustainedNotesRef.current.clear()
        }
      }
    },
    [sampler, isAudioStarted, isLoaded],
  )

  return {
    isAudioStarted,
    isLoaded,
    isSustainActive,
    startAudio,
    setSustain,
    playNote,
    stopNote,
  }
}

export default usePianoAudio
