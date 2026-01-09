import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import NotationDisplay from '../../components/NotationDisplay'
import useNoteMatching from '../../hooks/useNoteMatching'
import useScoreAudio from './hooks/useScoreAudio' // Uusi hook
import NoteInfoPanel from './components/NoteInfoPanel' // Uusi komponentti
import { NotationContainer, PageTitle, NotationSection, NotationWrapper } from './Notation.styles'

const DEFAULT_SCORE_URL =
  'https://opensheetmusicdisplay.github.io/demo/MuzioClementi_SonatinaOpus36No1_Part1.xml'

const Notation = () => {
  // State
  const [scoreUrl, setScoreUrl] = useState(DEFAULT_SCORE_URL)
  const [currentNotes, setCurrentNotes] = useState([])
  const [zoom, setZoom] = useState(1.0)
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true)
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(true)

  // Refs
  const notationRef = useRef(null)

  // Custom Hooks
  const { activeNotes, matchedNotes, setCurrentNotesUnderCursor, isMatched } = useNoteMatching()
  const { playScoreNotes } = useScoreAudio()

  // Event Handlers
  const handleNoteSelected = (notes, options = {}) => {
    setCurrentNotes(notes)
    setCurrentNotesUnderCursor(notes)

    // Autoplay logic delegated to hook
    const shouldAutoPlay = options.autoPlay !== undefined ? options.autoPlay : autoPlayEnabled
    playScoreNotes(notes, shouldAutoPlay)

    // Optional: Visual highlight on piano (if bridge supports it)
    if (window.highlightPianoChord && notes.length > 0) {
      // Highlight target notes briefly on piano keybed
      const notesToHighlight = notes.filter(n => !n.isTied).map(n => n.name)
      window.highlightPianoChord(notesToHighlight)
    }
  }

  const handleScoreChange = url => {
    setScoreUrl(url)
    setCurrentNotes([])
  }

  const handleSettingsChange = settings => {
    if (settings.autoPlay !== undefined) setAutoPlayEnabled(settings.autoPlay)
    if (settings.autoAdvance !== undefined) setAutoAdvanceEnabled(settings.autoAdvance)
  }

  // Effects
  useEffect(() => {
    if (isMatched && autoAdvanceEnabled && currentNotes.length > 0) {
      const timer = setTimeout(() => {
        if (notationRef.current?.next) {
          notationRef.current.next()
        }
      }, 200) // Slight delay helps user realize they got it right

      return () => clearTimeout(timer)
    }
  }, [isMatched, autoAdvanceEnabled, currentNotes])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setZoom(0.8)
      else setZoom(1.0)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
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
              ref={notationRef}
              scoreUrl={scoreUrl}
              onNoteSelected={handleNoteSelected}
              initialZoom={zoom}
              onZoomIn={setZoom}
              onZoomOut={setZoom}
              onScoreChange={handleScoreChange}
              onSettingsChange={handleSettingsChange}
            />
          </NotationWrapper>

          {/* New sub-component handles the display logic */}
          <NoteInfoPanel
            currentNotes={currentNotes}
            activeNotes={activeNotes}
            matchedNotes={matchedNotes}
            isMatched={isMatched}
          />
        </NotationSection>
      </motion.div>
    </NotationContainer>
  )
}

export default Notation
