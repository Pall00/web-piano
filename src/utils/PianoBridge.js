// src/utils/PianoBridge.js

/**
 * A utility to bridge between the FooterPiano component and other parts of the application
 * that need to trigger piano actions.
 */

// Store a reference to the piano component instance
let pianoInstance = null

// Array to store note event listeners
let noteListeners = []

/**
 * Normalizes a note name to match the format expected by the piano
 * @param {string} noteName - The note name to normalize (e.g., "C4", "D#3", "Eb5")
 * @returns {string} - The normalized note name for the piano component
 */
const normalizeNoteName = noteName => {
  if (!noteName) return ''

  try {
    // First, standardize the note name format
    let note = noteName.trim()

    // Extract the note letter and octave
    const match = note.match(/^([A-Ga-g][#♯b♭s]*)([0-9]+)$/)
    if (!match) {
      console.warn('Invalid note format:', noteName)
      return noteName
    }

    let [, notePart, octavePart] = match

    // Standardize the note part (C, C#, Db, etc.)
    notePart = notePart.charAt(0).toUpperCase() + notePart.slice(1)

    // Convert accidentals to the format expected by the piano
    // If your piano uses 's' for sharps instead of '#'
    if (pianoInstance && pianoInstance.useSharpS) {
      notePart = notePart.replace('#', 's').replace('♯', 's')
    } else {
      // Standardize to '#' for sharps if that's what the piano expects
      notePart = notePart.replace('s', '#').replace('♯', '#')
    }

    // Handle flats - convert to equivalent sharps if needed
    // This depends on how your piano handles flats
    if (notePart.includes('b') || notePart.includes('♭')) {
      // Map of flat notes to their sharp equivalents
      const flatToSharp = {
        Cb: 'B',
        Db: 'C#',
        Eb: 'D#',
        Fb: 'E',
        Gb: 'F#',
        Ab: 'G#',
        Bb: 'A#',
      }

      // Replace 'b' or '♭' with '' to get the flat note name
      const flatNote = notePart.replace('b', '').replace('♭', '')
      const flatKey = flatNote + 'b'

      if (flatToSharp[flatKey]) {
        notePart = flatToSharp[flatKey]

        // For Cb and Fb, we need to adjust the octave
        if (flatKey === 'Cb') {
          octavePart = String(parseInt(octavePart) - 1)
        }
      }
    }

    // Adjust octave for very low notes (may need customization based on your piano implementation)
    const octave = parseInt(octavePart)
    if (octave < 1) {
      // If the note is too low for Tone.js, transpose it up an octave
      octavePart = '1'
    } else if (octave > 7) {
      // If the note is too high for Tone.js, transpose it down an octave
      octavePart = '7'
    }

    // Combine note and octave
    const normalizedNote = notePart + octavePart
    console.warn(`Normalized note: ${noteName} -> ${normalizedNote}`)
    return normalizedNote
  } catch (error) {
    console.error('Error normalizing note name:', error)
    return noteName // Return original if processing fails
  }
}

/**
 * Set the piano instance reference
 * @param {object} instance - The FooterPiano component instance
 */
export const setPianoInstance = instance => {
  pianoInstance = instance

  // Make the playNote function available globally for easier access from components
  window.playPianoNote = noteName => {
    playNote(noteName)
  }

  // Make the playChord function available globally
  window.playPianoChord = noteNames => {
    playChord(noteNames)
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
      noteListeners.forEach(callback => callback(noteInfo))
    },
  }
}

/**
 * Play a note on the piano
 * @param {string} noteName - The name of the note to play (e.g., "C4", "D#3")
 */
export const playNote = noteName => {
  if (!pianoInstance) {
    console.warn('Piano instance not set. Call setPianoInstance first.')
    return
  }

  try {
    // Normalize the note name to the format expected by the piano
    const normalizedNote = normalizeNoteName(noteName)

    console.warn(`Playing note: ${noteName} (normalized: ${normalizedNote})`)

    // Play the note using the piano instance
    pianoInstance.playNote(normalizedNote)
  } catch (err) {
    console.error('Error playing note:', err)
  }
}

/**
 * Play multiple notes simultaneously (chord)
 * @param {string[]} noteNames - Array of note names to play
 */
export const playChord = noteNames => {
  if (!Array.isArray(noteNames) || noteNames.length === 0) {
    return
  }

  noteNames.forEach(noteName => {
    playNote(noteName)
  })
}

/**
 * Highlight a note on the piano without playing it
 * @param {string} noteName - The name of the note to highlight (e.g., "C4", "D#3")
 */
export const highlightNote = noteName => {
  if (!pianoInstance) {
    console.warn('Piano instance not set. Call setPianoInstance first.')
    return
  }

  try {
    // Normalize the note name to the format expected by the piano
    const normalizedNote = normalizeNoteName(noteName)

    // Highlight the note using the piano instance
    if (pianoInstance.highlightNote) {
      pianoInstance.highlightNote(normalizedNote)
    }
  } catch (err) {
    console.error('Error highlighting note:', err)
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
