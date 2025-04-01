// src/pages/Notation/Notation.jsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import NotationDisplay from '../../components/NotationDisplay'
import useNoteMatching from '../../hooks/useNoteMatching'
import {
  NotationContainer,
  PageTitle,
  NotationSection,
  InfoPanel,
  NotationWrapper,
} from './Notation.styles'

// Default score to load
const DEFAULT_SCORE_URL =
  'https://opensheetmusicdisplay.github.io/demo/MuzioClementi_SonatinaOpus36No1_Part1.xml'

const Notation = () => {
  const [scoreUrl, setScoreUrl] = useState(DEFAULT_SCORE_URL)
  const [currentNotes, setCurrentNotes] = useState([])
  const [zoom, setZoom] = useState(1.0)

  // Add the note matching hook
  const { activeNotes, setCurrentNotesUnderCursor, isMatched } = useNoteMatching()

  // Handle when a note is selected in the notation display
  const handleNoteSelected = notes => {
    setCurrentNotes(notes)

    // Pass the notes to our matching hook
    setCurrentNotesUnderCursor(notes)

    // If there are notes to play and the piano bridge is available
    if (notes.length > 0) {
      // If it's a chord (multiple notes)
      if (notes.length > 1) {
        // Play as a chord if we have the function available
        if (window.playPianoChord) {
          window.playPianoChord(notes.map(note => note.name))
        } else if (window.playPianoNote) {
          // Otherwise play notes individually with a tiny delay
          notes.forEach((note, index) => {
            setTimeout(() => {
              window.playPianoNote(note.name)
            }, index * 20) // 20ms delay between notes
          })
        }
      } else if (window.playPianoNote) {
        // Single note
        window.playPianoNote(notes[0].name)
      }
    }
  }

  // Handle score selection change
  const handleScoreChange = url => {
    setScoreUrl(url)
    setCurrentNotes([]) // Reset current notes when changing scores
  }

  // Handle zoom change
  const handleZoomIn = newZoom => {
    setZoom(newZoom)
  }

  const handleZoomOut = newZoom => {
    setZoom(newZoom)
  }

  // Auto-advance cursor when notes match (optional)
  useEffect(() => {
    // If notes match and auto-advance is enabled (could be a setting in the future)
    const autoAdvance = true // This could be a setting toggle

    if (isMatched && autoAdvance) {
      // Add a slight delay before advancing to next note
      const timer = setTimeout(() => {
        // If we have a reference to the notation display's next function, call it
        if (window.advanceNotationCursor) {
          window.advanceNotationCursor()
        }
      }, 300) // Short delay so user can see the match

      return () => clearTimeout(timer)
    }
  }, [isMatched])

  // Adjust layout on window resize
  useEffect(() => {
    const handleResize = () => {
      // You could adjust zoom based on window width if needed
      if (window.innerWidth < 768) {
        setZoom(0.8) // Smaller zoom for mobile
      }
    }

    // Set initial size
    handleResize()

    // Add event listener
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <NotationContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <PageTitle>Notation Practice</PageTitle>

        <NotationSection>
          <NotationWrapper>
            <NotationDisplay
              scoreUrl={scoreUrl}
              onNoteSelected={handleNoteSelected}
              initialZoom={zoom}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onScoreChange={handleScoreChange}
            />
          </NotationWrapper>

          {currentNotes.length > 0 && (
            <InfoPanel>
              <h3>
                Current Notes
                {isMatched && (
                  <span style={{ color: 'green', marginLeft: '10px' }}>✓ Correct!</span>
                )}
              </h3>
              <ul>
                {currentNotes.map((note, index) => (
                  <li
                    key={index}
                    style={{
                      color: activeNotes.includes(note.name) ? 'green' : 'inherit',
                    }}
                  >
                    {note.name} {note.midiNote ? `(MIDI: ${note.midiNote})` : ''}
                    {note.duration ? ` - Duration: ${note.duration}` : ''}
                  </li>
                ))}
              </ul>
            </InfoPanel>
          )}
        </NotationSection>
      </motion.div>
    </NotationContainer>
  )
}

export default Notation
