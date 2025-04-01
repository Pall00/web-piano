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

  // Settings moved to the top controls
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true)
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(true)

  // Add the note matching hook
  const { activeNotes, matchedNotes, setCurrentNotesUnderCursor, isMatched } = useNoteMatching()

  // Handle when a note is selected in the notation display
  const handleNoteSelected = (notes, options = {}) => {
    setCurrentNotes(notes)

    // Pass the notes to our matching hook
    setCurrentNotesUnderCursor(notes)

    // Check if auto-play should be used - prefer options from the event over state
    const shouldAutoPlay = options.autoPlay !== undefined ? options.autoPlay : autoPlayEnabled

    // If there are notes to play and auto-play is enabled
    if (notes.length > 0 && shouldAutoPlay) {
      // If it's a chord (multiple notes)
      if (notes.length > 1) {
        // Play as a chord if we have the function available
        if (window.playPianoChord) {
          // Play chord with demo source tag
          window.playPianoChord(
            notes.map(note => note.name),
            { source: 'demo' },
          )
        } else if (window.playPianoNote) {
          // Otherwise play notes individually with a tiny delay
          notes.forEach((note, index) => {
            setTimeout(() => {
              // Play each note with demo source tag
              window.playPianoNote(note.name, { source: 'demo' })
            }, index * 20) // 20ms delay between notes
          })
        }
      } else if (window.playPianoNote) {
        // Single note - play with demo source tag
        window.playPianoNote(notes[0].name, { source: 'demo' })
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

  // Handle settings changes from NotationDisplay
  const handleSettingsChange = settings => {
    if (settings.autoPlay !== undefined) {
      setAutoPlayEnabled(settings.autoPlay)
    }
    if (settings.autoAdvance !== undefined) {
      setAutoAdvanceEnabled(settings.autoAdvance)
    }
  }

  // Auto-advance cursor when notes match
  useEffect(() => {
    if (isMatched && autoAdvanceEnabled && currentNotes.length > 0) {
      // Add a slight delay before advancing to next note
      const timer = setTimeout(() => {
        if (window.notationCursor?.next) {
          window.notationCursor.next()
        }
      }, 100) // Short delay for faster response

      return () => clearTimeout(timer)
    }
  }, [isMatched, autoAdvanceEnabled, currentNotes])

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
              onSettingsChange={handleSettingsChange}
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
                      color: matchedNotes.includes(note.name)
                        ? 'green'
                        : activeNotes.includes(note.name)
                          ? 'blue'
                          : 'inherit',
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
