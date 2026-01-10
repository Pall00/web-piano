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

  // Hand Selection State: 'both', 'right', 'left'
  const [handSelection, setHandSelection] = useState('both')

  // Refs
  const notationRef = useRef(null)

  // Custom Hooks
  const { activeNotes, matchedNotes, setCurrentNotesUnderCursor, isMatched } =
    useNoteMatching(handSelection)
  const { playScoreNotes } = useScoreAudio()

  useEffect(() => {
    return () => {
      if (window.setPianoGuidance) window.setPianoGuidance([])
    }
  }, [])

  const handleNoteSelected = useCallback(
    (notes, options = {}) => {
      setCurrentNotes(notes)
      setCurrentNotesUnderCursor(notes)

      const shouldAutoPlay = options.autoPlay !== undefined ? options.autoPlay : autoPlayEnabled

      playScoreNotes(notes, shouldAutoPlay, options.bpm)

      const notesToHighlight = notes.map(n => n.name)

      if (window.setPianoGuidance) {
        window.setPianoGuidance(notesToHighlight)
      } else if (window.highlightPianoChord && notesToHighlight.length > 0) {
        window.highlightPianoChord(notesToHighlight)
      }
    },
    [autoPlayEnabled, playScoreNotes, setCurrentNotesUnderCursor],
  )

  const handleScoreChange = useCallback(url => {
    setScoreUrl(url)
    setCurrentNotes([])
    if (window.setPianoGuidance) window.setPianoGuidance([])
  }, [])

  const handleSettingsChange = useCallback(settings => {
    if (settings.autoPlay !== undefined) setAutoPlayEnabled(settings.autoPlay)
    if (settings.autoAdvance !== undefined) setAutoAdvanceEnabled(settings.autoAdvance)
  }, [])

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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setZoom(0.8)
      else setZoom(1.0)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const buttonStyle = isActive => ({
    padding: '8px 12px',
    margin: '0 5px',
    backgroundColor: isActive ? '#4CAF50' : '#ddd',
    color: isActive ? 'white' : 'black',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ width: '100%', height: '100%' }}
    >
      <NotationContainer>
        <ScoreArea>
          {/* Hand Selection Controls */}
          <div
            style={{
              padding: '10px',
              textAlign: 'center',
              background: '#f5f5f5',
              marginBottom: '10px',
              borderRadius: '8px',
            }}
          >
            <span style={{ marginRight: '10px', fontWeight: 'bold' }}>Practice Hand:</span>
            <button
              style={buttonStyle(handSelection === 'both')}
              onClick={() => setHandSelection('both')}
            >
              Both
            </button>
            <button
              style={buttonStyle(handSelection === 'right')}
              onClick={() => setHandSelection('right')}
            >
              Right (RH)
            </button>
            <button
              style={buttonStyle(handSelection === 'left')}
              onClick={() => setHandSelection('left')}
            >
              Left (LH)
            </button>
          </div>

          <NotationWrapper>
            {/* LISÄYS: Välitetään handSelection propsina */}
            <NotationDisplay
              ref={notationRef}
              scoreUrl={scoreUrl}
              onNoteSelected={handleNoteSelected}
              initialZoom={zoom}
              onZoomIn={setZoom}
              onZoomOut={setZoom}
              onScoreChange={handleScoreChange}
              onSettingsChange={handleSettingsChange}
              handSelection={handSelection}
            />
          </NotationWrapper>
        </ScoreArea>

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
