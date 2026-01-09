import logger from './logger'
import { midiToNote, frequencyToNote } from './musicTheory'

// Apufunktio: Tarkista onko nuotti sidottu (tied note)
// Siirretty tänne, jotta komponentti pysyy siistinä
export const isTiedNote = note => {
  try {
    // 1. Tarkista tie-relaatiot
    if (note.tie && note.tie.notes) {
      const tieNotes = note.tie.notes

      if (tieNotes.length > 1) {
        const noteIndex = tieNotes.indexOf(note)

        // Jos nuotti ei ole ensimmäinen, se on sidottu jatko-osa
        if (noteIndex > 0) {
          return true
        }

        // Tarkista tyyppi
        if (note.tie.Type === 'stop' || note.tie.Type === 'continue') {
          return true
        }
      }
    }

    // 2. Tarkista Notations.TiedList
    if (note.Notations && note.Notations.TiedList) {
      for (const tied of note.Notations.TiedList) {
        if (tied.Type === 'stop') {
          return true
        }
      }
    }

    // 3. Tarkista tie Type -ominaisuus
    if (note.tie && note.tie.Type) {
      if (note.tie.Type !== 'start' && note.tie.Type !== '') {
        return true
      }
    }

    return false
  } catch (err) {
    logger.warn('Error checking if note is tied:', err)
    return false
  }
}

// Apufunktio: Irrota nuottien tiedot kursorin alta
export const extractNotesInfo = notesUnderCursor => {
  try {
    const notes = notesUnderCursor
      .map(note => {
        if (!note) return null

        try {
          // Haetaan pitch (transponoitu tai normaali)
          const pitchObj = note.TransposedPitch || note.Pitch
          if (!pitchObj) return null

          let noteName = null

          // Yritetään ensin taajuudesta
          if (pitchObj.frequency && pitchObj.frequency > 0) {
            noteName = frequencyToNote(pitchObj.frequency)
          }

          // Jos ei onnistu, yritetään MIDIstä
          if (!noteName && pitchObj.halfTone !== undefined) {
            noteName = midiToNote(pitchObj.halfTone)
          }

          const duration = note.Length?.realValue || 0

          if (!noteName) return null

          // Tarkistetaan sidonta
          let isTied = isTiedNote(note)

          // Lisätarkistukset (double check)
          if (!isTied && note.tie && note.tie.notes && note.tie.notes.length > 1) {
            const indexInTie = note.tie.notes.indexOf(note)
            if (indexInTie > 0) {
              isTied = true
            } else if (indexInTie === 0 && note.tie.Type && note.tie.Type !== 'start') {
              isTied = true
            }
          }

          if (!isTied && note.TieList && note.TieList.length > 0) {
            for (const tie of note.TieList) {
              if (tie.Type === 'stop' || tie.Type === 'continue') {
                isTied = true
                break
              }
            }
          }

          return {
            name: noteName,
            duration: duration,
            midiNote: pitchObj.halfTone,
            isTied: isTied,
          }
        } catch (err) {
          logger.warn('Error extracting note details:', err)
          return null
        }
      })
      .filter(Boolean)

    return notes
  } catch (err) {
    logger.error('Error processing notes:', err)
    return []
  }
}
