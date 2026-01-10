// src/pages/Notation/hooks/useScoreAudio.js
import { useCallback } from 'react'

const useScoreAudio = () => {
  const playScoreNotes = useCallback((notes, autoPlayEnabled, bpm = 100) => {
    // Basic validation
    if (!notes || notes.length === 0 || !autoPlayEnabled) return

    // Do not filter out tied notes here; ScoreParser handles the logic.
    const notesToPlay = notes

    if (notesToPlay.length === 0) return

    // 1. Calculate note duration in seconds
    // notes[0].duration is now in BEATS (e.g. 1.0 = Quarter Note)
    // (Beats) * (60 / BPM) = Duration in seconds
    const beatDuration = notesToPlay[0].duration || 1
    // Subtract a tiny amount (0.05s) to ensure notes don't blur together excessively
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
      // Play single note
      if (window.playPianoNote) {
        window.playPianoNote(notesToPlay[0].name, { source: 'demo', duration: durationInSeconds })
      }
    }
  }, [])

  return { playScoreNotes }
}

export default useScoreAudio
