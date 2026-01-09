import { useCallback } from 'react'

const useScoreAudio = () => {
  const playScoreNotes = useCallback((notes, autoPlayEnabled) => {
    if (!notes || notes.length === 0 || !autoPlayEnabled) return

    // Filter out tied notes (should not be re-attacked)
    const notesToPlay = notes.filter(note => !note.isTied)

    if (notesToPlay.length === 0) return

    // Logic for chords vs single notes
    if (notesToPlay.length > 1) {
      // Play chord
      if (window.playPianoChord) {
        window.playPianoChord(
          notesToPlay.map(note => note.name),
          { source: 'demo' },
        )
      } else if (window.playPianoNote) {
        // Fallback: arpeggiate slightly
        notesToPlay.forEach((note, index) => {
          setTimeout(() => {
            window.playPianoNote(note.name, { source: 'demo' })
          }, index * 20)
        })
      }
    } else {
      // Single note
      if (window.playPianoNote) {
        window.playPianoNote(notesToPlay[0].name, { source: 'demo' })
      }
    }
  }, [])

  return { playScoreNotes }
}

export default useScoreAudio
