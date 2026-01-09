// src/utils/PianoBridge.js
import logger from './logger'
import { normalizeNote, isPlayableNote } from './musicTheory'

let pianoInstance = null
let noteListeners = []

export const setPianoInstance = instance => {
  pianoInstance = instance

  window.playPianoNote = (noteName, options = {}) => {
    playNote(noteName, options)
  }

  window.playPianoChord = (noteNames, options = {}) => {
    playChord(noteNames, options)
  }

  window.highlightPianoNote = noteName => {
    highlightNote(noteName)
  }

  window.highlightPianoChord = noteNames => {
    highlightChord(noteNames)
  }

  // UUSI: Globaali funktio pysyvälle opastukselle
  window.setPianoGuidance = noteNames => {
    setGuidanceNotes(noteNames)
  }

  window.pianoEvents = {
    subscribe: callback => {
      noteListeners.push(callback)
      return () => {
        noteListeners = noteListeners.filter(cb => cb !== callback)
      }
    },
    notify: noteInfo => {
      const eventWithSource = {
        ...noteInfo,
        source: noteInfo.source || 'user',
      }
      noteListeners.forEach(callback => callback(eventWithSource))
    },
  }
}

export const playNote = (noteName, options = {}) => {
  if (!pianoInstance) {
    logger.warn('Piano instance not set. Call setPianoInstance first.')
    return
  }

  try {
    const normalizedNote = normalizeNote(noteName)

    if (!normalizedNote || !isPlayableNote(normalizedNote)) {
      logger.warn(`Note ${noteName} is invalid or out of playable range`)
      return
    }

    logger.info(`Playing note: ${noteName} (normalized: ${normalizedNote})`)

    if (window.pianoEvents) {
      window.pianoEvents.notify({
        note: normalizedNote,
        action: 'pressed',
        source: options.source || 'program',
      })

      setTimeout(() => {
        window.pianoEvents.notify({
          note: normalizedNote,
          action: 'released',
          source: options.source || 'program',
        })
      }, 300)
    }

    pianoInstance.playNote(normalizedNote)
  } catch (err) {
    logger.error('Error playing note:', err)
  }
}

export const playChord = (noteNames, options = {}) => {
  if (!Array.isArray(noteNames) || noteNames.length === 0) {
    return
  }

  noteNames.forEach(noteName => {
    playNote(noteName, options)
  })
}

export const highlightNote = noteName => {
  if (!pianoInstance) return
  try {
    const normalizedNote = normalizeNote(noteName)
    if (!normalizedNote) return
    if (pianoInstance.highlightNote) {
      pianoInstance.highlightNote(normalizedNote)
    }
  } catch (err) {
    logger.error('Error highlighting note:', err)
  }
}

export const highlightChord = noteNames => {
  if (!Array.isArray(noteNames) || noteNames.length === 0) return
  noteNames.forEach(noteName => {
    highlightNote(noteName)
  })
}

// UUSI: Exportattu funktio opastusnuoteille
export const setGuidanceNotes = noteNames => {
  if (!pianoInstance) return
  try {
    const notesArray = Array.isArray(noteNames) ? noteNames : []
    const normalizedNotes = notesArray.map(name => normalizeNote(name)).filter(Boolean)

    if (pianoInstance.setGuidanceNotes) {
      pianoInstance.setGuidanceNotes(normalizedNotes)
    }
  } catch (err) {
    logger.error('Error setting guidance notes:', err)
  }
}

export default {
  setPianoInstance,
  playNote,
  playChord,
  highlightNote,
  highlightChord,
  setGuidanceNotes, // Lisätty
}
