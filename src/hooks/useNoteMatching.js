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

    // Filter out tied notes logic (Simplified & Silent)
    const requiredNotes = currentNotesUnderCursor.filter(note => !note.isTied)

    // If only tied notes remain (should be rare with new parser), match automatically
    if (requiredNotes.length === 0 && currentNotesUnderCursor.length > 0) {
      setIsMatched(true)
      return
    }

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
