// src/pages/Notation/Notation.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
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

  // Poistetaan opastus kun komponentti unmounttaa
  useEffect(() => {
    return () => {
      if (window.setPianoGuidance) window.setPianoGuidance([])
    }
  }, [])

  // --- KORJAUS ALKAA: Käytetään useCallbackia ---

  const handleNoteSelected = useCallback(
    (notes, options = {}) => {
      setCurrentNotes(notes)
      setCurrentNotesUnderCursor(notes)

      const shouldAutoPlay = options.autoPlay !== undefined ? options.autoPlay : autoPlayEnabled

      // VÄLITÄ options.bpm
      playScoreNotes(notes, shouldAutoPlay, options.bpm)

      // Visual highlight on piano
      const notesToHighlight = notes.filter(n => !n.isTied).map(n => n.name)

      if (window.setPianoGuidance) {
        window.setPianoGuidance(notesToHighlight)
      } else if (window.highlightPianoChord && notesToHighlight.length > 0) {
        window.highlightPianoChord(notesToHighlight)
      }
    },
    [autoPlayEnabled, playScoreNotes, setCurrentNotesUnderCursor],
  ) // Riippuvuudet

  const handleScoreChange = useCallback(url => {
    setScoreUrl(url)
    setCurrentNotes([])
    if (window.setPianoGuidance) window.setPianoGuidance([])
  }, [])

  const handleSettingsChange = useCallback(settings => {
    if (settings.autoPlay !== undefined) setAutoPlayEnabled(settings.autoPlay)
    if (settings.autoAdvance !== undefined) setAutoAdvanceEnabled(settings.autoAdvance)
  }, [])

  // --- KORJAUS PÄÄTTYY ---

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
      style={{ width: '100%', height: '100%' }}
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
        </Sidebar>
      </NotationContainer>
    </motion.div>
  )
}

export default Notation
