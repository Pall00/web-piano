// src/hooks/useNoteMatching.js
import { useState, useEffect, useRef } from 'react'

/**
 * Hook to handle matching played piano notes with notation notes
 */
const useNoteMatching = () => {
  const [currentNotesUnderCursor, setCurrentNotesUnderCursor] = useState([])
  const [matchedNotes, setMatchedNotes] = useState(new Set())
  const [activeNotes, setActiveNotes] = useState(new Set())
  const [isMatched, setIsMatched] = useState(false)
  const currentNotesRef = useRef([])

  useEffect(() => {
    if (!window.pianoEvents) {
      return () => {}
    }

    const handleNoteEvent = noteInfo => {
      if (noteInfo.source !== 'user') return

      if (noteInfo.action === 'pressed') {
        setActiveNotes(prev => {
          const newSet = new Set(prev)
          newSet.add(noteInfo.note)
          return newSet
        })
        setMatchedNotes(prev => {
          const newSet = new Set(prev)
          newSet.add(noteInfo.note)
          return newSet
        })
      } else if (noteInfo.action === 'released') {
        setActiveNotes(prev => {
          const newSet = new Set(prev)
          newSet.delete(noteInfo.note)
          return newSet
        })
      }
    }

    const unsubscribe = window.pianoEvents.subscribe(handleNoteEvent)
    return unsubscribe
  }, [])

  useEffect(() => {
    currentNotesRef.current = currentNotesUnderCursor
    setIsMatched(false)
    setMatchedNotes(new Set())
  }, [currentNotesUnderCursor])

  // Check for matches
  useEffect(() => {
    if (!currentNotesUnderCursor.length) {
      setIsMatched(false)
      return
    }

    // KORJAUS: Poistettu .filter(note => !note.isTied)
    // ScoreParser palauttaa vain nuotit, jotka pitää soittaa (attack).
    // Käyttäjän on soitettava myös sidotun nuotin alku.
    const requiredNotes = currentNotesUnderCursor

    const requiredNoteNames = requiredNotes.map(note => note.name)
    const allNotesPlayed = requiredNoteNames.every(note => matchedNotes.has(note))

    setIsMatched(allNotesPlayed && requiredNoteNames.length > 0)
  }, [matchedNotes, currentNotesUnderCursor])

  return {
    activeNotes: Array.from(activeNotes),
    matchedNotes: Array.from(matchedNotes),
    setCurrentNotesUnderCursor,
    isMatched,
  }
}

export default useNoteMatching
