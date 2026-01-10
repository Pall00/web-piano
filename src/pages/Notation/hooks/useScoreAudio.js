// src/pages/Notation/hooks/useScoreAudio.js
import { useCallback } from 'react'

const useScoreAudio = () => {
  const playScoreNotes = useCallback((notes, autoPlayEnabled, bpm = 100) => {
    // Perustarkistukset
    if (!notes || notes.length === 0 || !autoPlayEnabled) return

    // KORJAUS: Emme enää suodata pois sidottuja nuotteja (!note.isTied).
    // ScoreParser on jo poistanut "hiljaiset hännät".
    // Jos nuotti on listalla, se on tarkoitettu soitettavaksi (myös pitkät äänet).
    const notesToPlay = notes

    if (notesToPlay.length === 0) return

    // 1. Laske nuotin kesto sekunneissa
    // notes[0].duration on iskuina (esim 1.0 = neljäsosa)
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
