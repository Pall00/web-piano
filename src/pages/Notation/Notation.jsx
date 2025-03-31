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

    // If your FooterPiano component can play notes, you could trigger it here
    // For example:
    if (notes.length > 0 && window.playPianoNote) {
      notes.forEach(note => {
        window.playPianoNote(note.name)
      })
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
                    {note.name} - Duration: {note.duration}
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
