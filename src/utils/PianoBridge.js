// src/utils/PianoBridge.js

/**
 * A utility to bridge between the FooterPiano component and other parts of the application
 * that need to trigger piano actions.
 *
 * This is a simple implementation - in a real-world app, you might use a more robust
 * state management solution like Redux or the Context API.
 */

// Store a reference to the piano component instance
let pianoInstance = null

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
    // Format might need to be adjusted depending on how your piano component works
    pianoInstance.playNote(noteName)
  } catch (err) {
    console.error('Error playing note:', err)
  }
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
    // This depends on the API of your piano component
    if (pianoInstance.highlightNote) {
      pianoInstance.highlightNote(noteName)
    }
  } catch (err) {
    console.error('Error highlighting note:', err)
  }
}

export default {
  setPianoInstance,
  playNote,
  highlightNote,
}
