// src/pages/Notation/Notation.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import NotationDisplay from '../../components/NotationDisplay'
import ScoreSelector from '../../components/NotationDisplay/ScoreSelector'
import { NotationContainer, PageTitle, NotationSection, InfoPanel } from './Notation.styles'

// Default score to load
const DEFAULT_SCORE_URL =
  'https://opensheetmusicdisplay.github.io/demo/MuzioClementi_SonatinaOpus36No1_Part1.xml'

const Notation = () => {
  const [scoreUrl, setScoreUrl] = useState(DEFAULT_SCORE_URL)
  const [currentNotes, setCurrentNotes] = useState([])

  // Handle when a note is selected in the notation display
  const handleNoteSelected = notes => {
    setCurrentNotes(notes)

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

  return (
    <NotationContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <PageTitle>Notation Practice</PageTitle>

        <ScoreSelector onScoreChange={handleScoreChange} />

        <NotationSection>
          <NotationDisplay
            scoreUrl={scoreUrl}
            onNoteSelected={handleNoteSelected}
            initialZoom={1.0}
          />

          {currentNotes.length > 0 && (
            <InfoPanel>
              <h3>Current Notes</h3>
              <ul>
                {currentNotes.map((note, index) => (
                  <li key={index}>
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
