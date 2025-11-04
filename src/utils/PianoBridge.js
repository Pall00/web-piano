// src/utils/PianoBridge.js
import logger from './logger'
import { normalizeNote, isPlayableNote } from './musicTheory'

/**
 * A utility to bridge between the FooterPiano component and other parts of the application
 * that need to trigger piano actions.
 */

// Store a reference to the piano component instance
let pianoInstance = null

// Array to store note event listeners
let noteListeners = []

/**
 * Set the piano instance reference
 * @param {object} instance - The FooterPiano component instance
 */
export const setPianoInstance = instance => {
  pianoInstance = instance

  // Make the playNote function available globally for easier access from components
  window.playPianoNote = (noteName, options = {}) => {
    playNote(noteName, options)
  }

  // Make the playChord function available globally
  window.playPianoChord = (noteNames, options = {}) => {
    playChord(noteNames, options)
  }

  // Make the highlight functions available globally
  window.highlightPianoNote = noteName => {
    highlightNote(noteName)
  }

  window.highlightPianoChord = noteNames => {
    highlightChord(noteNames)
  }

  // Make the subscription system available globally
  window.pianoEvents = {
    subscribe: callback => {
      noteListeners.push(callback)
      // Return function to unsubscribe
      return () => {
        noteListeners = noteListeners.filter(cb => cb !== callback)
      }
    },
    notify: noteInfo => {
      // Ensure the event has a source property
      const eventWithSource = {
        ...noteInfo,
        // Default to "user" if no source is provided
        source: noteInfo.source || 'user',
      }
      noteListeners.forEach(callback => callback(eventWithSource))
    },
  }
}

/**
 * Play a note on the piano
 * @param {string} noteName - The name of the note to play (e.g., "C4", "D#3")
 * @param {object} options - Additional options for playing the note
 * @param {string} options.source - The source of the note event (e.g., "user", "demo")
 */
export const playNote = (noteName, options = {}) => {
  if (!pianoInstance) {
    logger.warn('Piano instance not set. Call setPianoInstance first.')
    return
  }

  try {
    // Normalize the note name using centralized function
    const normalizedNote = normalizeNote(noteName)

    if (!normalizedNote || !isPlayableNote(normalizedNote)) {
      logger.warn(`Note ${noteName} is invalid or out of playable range`)
      return
    }

    logger.info(`Playing note: ${noteName} (normalized: ${normalizedNote})`)

    // Notify listeners with the provided source
    if (window.pianoEvents) {
      window.pianoEvents.notify({
        note: normalizedNote,
        action: 'pressed',
        source: options.source || 'program',
      })

      // After a short delay, simulate note release (for non-sustained notes)
      setTimeout(() => {
        window.pianoEvents.notify({
          note: normalizedNote,
          action: 'released',
          source: options.source || 'program',
        })
      }, 300)
    }

    // Play the note using the piano instance
    pianoInstance.playNote(normalizedNote)
  } catch (err) {
    logger.error('Error playing note:', err)
  }
}

/**
 * Play multiple notes simultaneously (chord)
 * @param {string[]} noteNames - Array of note names to play
 * @param {object} options - Additional options for playing the note
 * @param {string} options.source - The source of the note event (e.g., "user", "demo")
 */
export const playChord = (noteNames, options = {}) => {
  if (!Array.isArray(noteNames) || noteNames.length === 0) {
    return
  }

  noteNames.forEach(noteName => {
    playNote(noteName, options)
  })
}

/**
 * Highlight a note on the piano without playing it
 * @param {string} noteName - The name of the note to highlight (e.g., "C4", "D#3")
 */
export const highlightNote = noteName => {
  if (!pianoInstance) {
    logger.warn('Piano instance not set. Call setPianoInstance first.')
    return
  }

  try {
    // Normalize the note name using centralized function
    const normalizedNote = normalizeNote(noteName)

    if (!normalizedNote) {
      logger.warn(`Invalid note format: ${noteName}`)
      return
    }

    // Highlight the note using the piano instance
    if (pianoInstance.highlightNote) {
      pianoInstance.highlightNote(normalizedNote)
    }
  } catch (err) {
    logger.error('Error highlighting note:', err)
  }
}

/**
 * Highlight multiple notes simultaneously
 * @param {string[]} noteNames - Array of note names to highlight
 */
export const highlightChord = noteNames => {
  if (!Array.isArray(noteNames) || noteNames.length === 0) {
    return
  }

  noteNames.forEach(noteName => {
    highlightNote(noteName)
  })
}

export default {
  setPianoInstance,
  playNote,
  playChord,
  highlightNote,
  highlightChord,
}
