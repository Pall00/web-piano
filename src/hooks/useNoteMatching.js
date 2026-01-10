// src/hooks/useNoteMatching.js
import { useState, useEffect, useRef } from 'react'

/**
 * Hook to handle matching played piano notes with notation notes.
 * Hand filtering is handled upstream in NotationDisplay.
 */
const useNoteMatching = () => {
  const [currentNotesUnderCursor, setCurrentNotesUnderCursor] = useState([])
  const [matchedNotes, setMatchedNotes] = useState(new Set())
  const [activeNotes, setActiveNotes] = useState(new Set())
  const [isMatched, setIsMatched] = useState(false)

  const activeNotesRef = useRef(new Set())

  // Subscribe to piano events (from PianoBridge)
  useEffect(() => {
    if (!window.pianoEvents) return

    const handleNoteEvent = noteInfo => {
      if (noteInfo.source !== 'user') return

      if (noteInfo.action === 'pressed') {
        setActiveNotes(prev => {
          const newSet = new Set(prev)
          newSet.add(noteInfo.note)
          activeNotesRef.current = newSet
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
          activeNotesRef.current = newSet
          return newSet
        })
      }
    }

    const unsubscribe = window.pianoEvents.subscribe(handleNoteEvent)
    return unsubscribe
  }, [])

  // Fix for Tied Notes: Check if required notes are already held down
  useEffect(() => {
    setIsMatched(false)

    // Check which of the required notes are currently held down
    const alreadyHeldNotes = currentNotesUnderCursor.filter(note =>
      activeNotesRef.current.has(note.name),
    )

    // Pre-match them (so user doesn't have to re-press tied notes)
    const initialMatches = new Set()
    alreadyHeldNotes.forEach(n => initialMatches.add(n.name))

    setMatchedNotes(initialMatches)
  }, [currentNotesUnderCursor])

  // Verify completion
  useEffect(() => {
    if (!currentNotesUnderCursor.length) {
      // If list is empty (e.g. rest in selected hand), assume matched
      setIsMatched(currentNotesUnderCursor.length > 0)
      return
    }

    const requiredNoteNames = currentNotesUnderCursor.map(note => note.name)
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
