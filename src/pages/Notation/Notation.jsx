import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import NotationDisplay from '../../components/NotationDisplay'
import useNoteMatching from '../../hooks/useNoteMatching'
import useScoreAudio from './hooks/useScoreAudio'
import NoteInfoPanel from './components/NoteInfoPanel'
import {
  NotationContainer,
  ScoreArea,
  Sidebar,
  PageTitle,
  NotationWrapper,
} from './Notation.styles'

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

    // Visual highlight on piano
    if (window.highlightPianoChord && notes.length > 0) {
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

  // Auto-advance logic
  useEffect(() => {
    if (isMatched && autoAdvanceEnabled && currentNotes.length > 0) {
      const timer = setTimeout(() => {
        if (notationRef.current?.next) {
          notationRef.current.next()
        }
      }, 200)

      return () => clearTimeout(timer)
    }
  }, [isMatched, autoAdvanceEnabled, currentNotes])

  // Responsive zoom
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ width: '100%', height: '100%' }} // Ensure motion div takes full space
    >
      <NotationContainer>
        {/* VASEN SARAKE: Nuotit ja kontrollit */}
        <ScoreArea>
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
        </ScoreArea>

        {/* OIKEA SARAKE: Sivupalkki (Dashboard) */}
        <Sidebar>
          <PageTitle>Practice Dashboard</PageTitle>

          <NoteInfoPanel
            currentNotes={currentNotes}
            activeNotes={activeNotes}
            matchedNotes={matchedNotes}
            isMatched={isMatched}
          />

          {/* Tähän voi myöhemmin lisätä esim. Metronomin tai Soittohistorian */}
        </Sidebar>
      </NotationContainer>
    </motion.div>
  )
}

export default Notation
