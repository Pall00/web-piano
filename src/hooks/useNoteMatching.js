// src/hooks/useNoteMatching.js
import { useState, useEffect, useRef } from 'react'
import logger from '../utils/logger'

/**
 * Hook to handle matching played piano notes with notation notes
 * Modified to work with quick note presses and handle tied notes
 */
const useNoteMatching = () => {
  // Current notes under the cursor in notation
  const [currentNotesUnderCursor, setCurrentNotesUnderCursor] = useState([])

  // Notes that have been played for the current cursor position
  // This tracks notes that have been played, not just ones currently held down
  const [matchedNotes, setMatchedNotes] = useState(new Set())

  // Active notes (currently held down) - used for visual feedback only
  const [activeNotes, setActiveNotes] = useState(new Set())

  // Whether all required notes have been played
  const [isMatched, setIsMatched] = useState(false)

  // Reference to keep track of current cursor notes for the effect cleanup
  const currentNotesRef = useRef([])

  // Subscribe to piano note events
  useEffect(() => {
    // Skip if piano events not available
    if (!window.pianoEvents) {
      logger.warn('Piano events system not available')
      return () => {}
    }

    const handleNoteEvent = noteInfo => {
      // Only process events from the user (ignore demo/program events)
      if (noteInfo.source !== 'user') {
        return
      }

      if (noteInfo.action === 'pressed') {
        // Update currently active notes (for visual feedback)
        setActiveNotes(prev => {
          const newSet = new Set(prev)
          newSet.add(noteInfo.note)
          return newSet
        })

        // Add to the set of matched notes for the current cursor position
        setMatchedNotes(prev => {
          const newSet = new Set(prev)
          newSet.add(noteInfo.note)
          return newSet
        })
      } else if (noteInfo.action === 'released') {
        // Only update active notes, matched notes stay matched
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

  // Reset matched notes when current notes change
  useEffect(() => {
    // Update reference for cleanup
    currentNotesRef.current = currentNotesUnderCursor

    // Reset match state and matched notes
    setIsMatched(false)
    setMatchedNotes(new Set())

    return () => {
      // This will run when currentNotesUnderCursor changes again
      // or when the component unmounts
    }
  }, [currentNotesUnderCursor])

  // Check for matches when matched notes change
  useEffect(() => {
    if (!currentNotesUnderCursor.length) {
      setIsMatched(false)
      return
    }

    // Get non-tied notes that need to be played
    const requiredNotes = currentNotesUnderCursor.filter(note => !note.isTied)

    // Log information about tied notes for debugging
    if (currentNotesUnderCursor.some(note => note.isTied)) {
      logger.warn(
        'Found tied notes:',
        currentNotesUnderCursor.filter(note => note.isTied).map(note => note.name),
      )
      logger.warn(
        'Notes requiring play:',
        requiredNotes.map(note => note.name),
      )
    }

    // If all notes are tied, consider it matched automatically
    if (requiredNotes.length === 0 && currentNotesUnderCursor.some(note => note.isTied)) {
      logger.warn('All notes are tied - auto-advancing cursor')
      setIsMatched(true)
      return
    }

    // Get note names from non-tied notes
    const requiredNoteNames = requiredNotes.map(note => note.name)

    // Check if all required notes have been played
    const allNotesPlayed = requiredNoteNames.every(note => matchedNotes.has(note))

    // Update match state if all required notes are played
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
