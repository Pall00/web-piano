// src/hooks/useNoteMatching.js
import { useState, useEffect } from 'react'

/**
 * Hook to handle matching played piano notes with notation notes
 */
const useNoteMatching = () => {
  // Current notes under the cursor in notation
  const [currentNotesUnderCursor, setCurrentNotesUnderCursor] = useState([])

  // Active notes being played on the piano
  const [activeNotes, setActiveNotes] = useState(new Set())

  // Whether the played notes match the cursor notes
  const [isMatched, setIsMatched] = useState(false)

  // Subscribe to piano note events
  useEffect(() => {
    // Skip if piano events not available
    if (!window.pianoEvents) {
      console.warn('Piano events system not available')
      return () => {}
    }

    const handleNoteEvent = noteInfo => {
      if (noteInfo.action === 'pressed') {
        setActiveNotes(prev => {
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

    // Subscribe to piano events
    const unsubscribe = window.pianoEvents.subscribe(handleNoteEvent)

    // Cleanup on unmount
    return unsubscribe
  }, [])

  // Check for matches when active notes or current notes change
  useEffect(() => {
    if (!currentNotesUnderCursor.length) {
      setIsMatched(false)
      return
    }

    // Simple matching - Check if all cursor notes are being played
    const cursorNoteNames = currentNotesUnderCursor.map(note => note.name)
    const activeNotesArray = Array.from(activeNotes)

    // Debug logging
    console.log('Cursor notes:', cursorNoteNames)
    console.log('Active notes:', activeNotesArray)

    // Check if all cursor notes are played
    const allNotesPlayed = cursorNoteNames.every(note => activeNotes.has(note))

    setIsMatched(allNotesPlayed && cursorNoteNames.length > 0)
  }, [activeNotes, currentNotesUnderCursor])

  return {
    activeNotes: Array.from(activeNotes),
    setCurrentNotesUnderCursor,
    isMatched,
  }
}

export default useNoteMatching
