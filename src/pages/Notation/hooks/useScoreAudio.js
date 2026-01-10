// src/pages/Notation/hooks/useScoreAudio.js
import { useCallback } from 'react'

const useScoreAudio = () => {
  // Lisää bpm parametriksi (oletus 100)
  const playScoreNotes = useCallback((notes, autoPlayEnabled, bpm = 100) => {
    if (!notes || notes.length === 0 || !autoPlayEnabled) return

    const notesToPlay = notes.filter(note => !note.isTied)

    if (notesToPlay.length === 0) return

    // 1. Laske nuotin kesto sekunneissa
    // notes[0].duration on iskuina (esim 1.0 = neljäsosa)
    // (Iskut) * (60 / BPM) = Kesto sekunneissa
    // Vähennämme hieman (0.1s) jotta nuotit eivät puuroudu ("legato" vs "staccato")
    const beatDuration = notesToPlay[0].duration || 1
    const durationInSeconds = Math.max(0.1, beatDuration * (60 / bpm) - 0.05)

    if (notesToPlay.length > 1) {
      // Play chord
      if (window.playPianoChord) {
        window.playPianoChord(
          notesToPlay.map(note => note.name),
          { source: 'demo', duration: durationInSeconds },
        )
      } else if (window.playPianoNote) {
        notesToPlay.forEach((note, index) => {
          setTimeout(() => {
            window.playPianoNote(note.name, { source: 'demo', duration: durationInSeconds })
          }, index * 20)
        })
      }
    } else {
      // Single note
      if (window.playPianoNote) {
        window.playPianoNote(notesToPlay[0].name, { source: 'demo', duration: durationInSeconds })
      }
    }
  }, [])

  return { playScoreNotes }
}

export default useScoreAudio
