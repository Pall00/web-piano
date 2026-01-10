// src/components/NotationDisplay/NotationDisplay.jsx
import { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react'
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay'
import { SAMPLE_SCORES } from '../../data/scoreData'
import logger from '../../utils/logger'
import { parseScore } from '../../utils/ScoreParser'
import {
  NotationDisplayContainer,
  NotationCanvas,
  ControlsContainer,
  ZoomControls,
  ScoreSelectorControls,
  CursorControls,
  Button,
  NavigationButton,
  PlayButton,
  ZoomLevel,
  HorizontalScrollContainer,
  Select,
  SelectorLabel,
  UploadButton,
  FileInput,
  SettingsToggle,
  SettingsContainer,
  TempoControl,
} from './NotationDisplay.styles'

const DEFAULT_SCORE_URL =
  'https://opensheetmusicdisplay.github.io/demo/MuzioClementi_SonatinaOpus36No1_Part1.xml'

const defaultOptions = {
  autoResize: true,
  drawTitle: true,
  drawCredits: false,
  drawSubtitle: false,
  followCursor: true,
  disableCursor: false,
  drawMeasureNumbers: true,
  drawTimeSignatures: true,
  drawFingerings: true,
  renderSingleHorizontalStaffline: false,
  backend: 'svg',
}

const NotationDisplay = forwardRef(
  (
    {
      scoreUrl = DEFAULT_SCORE_URL,
      onNoteSelected,
      initialZoom = 1.0,
      onZoomIn,
      onZoomOut,
      onScoreChange,
      onSettingsChange,
      handSelection = 'both',
    },
    ref,
  ) => {
    const osmdContainerRef = useRef(null)
    const osmdRef = useRef(null)
    const playbackTimeoutRef = useRef(null)

    const [isLoaded, setIsLoaded] = useState(false)
    const [zoom, setZoom] = useState(initialZoom)
    const [pianoStaffIds, setPianoStaffIds] = useState({ right: 1, left: 2 })

    const zoomRef = useRef(zoom)
    useEffect(() => {
      zoomRef.current = zoom
    }, [zoom])

    const [error, setError] = useState(null)
    const [isInitialized, setIsInitialized] = useState(false)
    const [selectedScore, setSelectedScore] = useState(SAMPLE_SCORES[0].id)
    const [scoreLoaded, setScoreLoaded] = useState(false)
    const [scoreEvents, setScoreEvents] = useState([])
    const [currentEventIndex, setCurrentEventIndex] = useState(0)

    const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(true)
    const [autoPlayEnabled, setAutoPlayEnabled] = useState(true)
    const [horizontalMode, setHorizontalMode] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [bpm, setBpm] = useState(100)

    /**
     * Identify Piano Staves using Global Vertical Index.
     */
    const updateStaffVisibility = useCallback(() => {
      if (!osmdRef.current || !osmdRef.current.Sheet) return

      const allStavesGlobal = osmdRef.current.Sheet.Staves
      const instruments = osmdRef.current.Sheet.Instruments
      let potentialPianoInstruments = []

      const namedPianos = instruments.filter(i => {
        const name = i.NameLabel ? i.NameLabel.text.toLowerCase() : ''
        return name.includes('piano') || name.includes('pno') || name.includes('klavier')
      })

      if (namedPianos.length > 0) {
        potentialPianoInstruments = namedPianos
      }

      // Handle split staves (common in XML)
      if (
        potentialPianoInstruments.length === 1 &&
        potentialPianoInstruments[0].Staves.length === 1 &&
        instruments.length > 1
      ) {
        const pianoIndex = instruments.indexOf(potentialPianoInstruments[0])
        if (instruments[pianoIndex + 1]) {
          potentialPianoInstruments.push(instruments[pianoIndex + 1])
        }
      }

      // Fallbacks
      if (potentialPianoInstruments.length === 0) {
        const grandStaff = instruments.find(i => i.Staves.length > 1)
        if (grandStaff) potentialPianoInstruments = [grandStaff]
      }
      if (potentialPianoInstruments.length === 0 && instruments.length > 0) {
        potentialPianoInstruments = instruments.slice(0, 2)
      }

      if (potentialPianoInstruments.length > 0) {
        const pianoStaves = potentialPianoInstruments.flatMap(i => i.Staves)

        let rightId = 1
        let leftId = -1

        if (pianoStaves.length > 0) {
          const firstStaffIndex = allStavesGlobal.indexOf(pianoStaves[0])
          if (firstStaffIndex !== -1) rightId = firstStaffIndex + 1
        }

        if (pianoStaves.length > 1) {
          const secondStaffIndex = allStavesGlobal.indexOf(pianoStaves[1])
          if (secondStaffIndex !== -1) leftId = secondStaffIndex + 1
        }

        setPianoStaffIds({ right: rightId, left: leftId })
        logger.info(`NotationDisplay: Global Staff Indexes - Right: ${rightId}, Left: ${leftId}`)

        instruments.forEach(instr => {
          const isPianoPart = potentialPianoInstruments.includes(instr)

          if (!isPianoPart) {
            instr.Visible = false
          } else {
            instr.Visible = true
            instr.Staves.forEach(staff => {
              const globalIndex = allStavesGlobal.indexOf(staff)
              const globalId = globalIndex + 1

              if (handSelection === 'both') {
                staff.Visible = true
              } else if (handSelection === 'right') {
                staff.Visible = globalId === rightId
              } else if (handSelection === 'left') {
                staff.Visible = globalId === leftId
              }
            })
          }
        })

        try {
          osmdRef.current.render()
        } catch (err) {
          logger.warn('Render warning during visibility update', err)
        }
      }
    }, [handSelection])

    useEffect(() => {
      if (isLoaded && scoreLoaded) {
        updateStaffVisibility()
      }
    }, [handSelection, isLoaded, scoreLoaded, updateStaffVisibility])

    // Cleanup
    useEffect(() => {
      return () => {
        if (playbackTimeoutRef.current) clearTimeout(playbackTimeoutRef.current)
      }
    }, [])

    useEffect(() => {
      if (!isPlaying && playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current)
        playbackTimeoutRef.current = null
      }
    }, [isPlaying])

    const syncToEvent = useCallback(
      index => {
        if (!scoreEvents || scoreEvents.length === 0 || index < 0 || index >= scoreEvents.length)
          return

        const targetEvent = scoreEvents[index]
        const osmd = osmdRef.current

        if (osmd && osmd.cursor) {
          try {
            osmd.cursor.reset()
            const iterator = osmd.cursor.Iterator
            while (
              !iterator.EndReached &&
              iterator.CurrentSourceTimestamp.RealValue < targetEvent.timestamp - 0.001
            ) {
              osmd.cursor.next()
            }
            osmd.cursor.update()
          } catch (err) {
            logger.warn('Cursor sync warning', err)
          }
        }

        if (onNoteSelected) {
          const relevantNotes = targetEvent.notes.filter(n => {
            const isRightHand = n.staffId === pianoStaffIds.right
            const isLeftHand = n.staffId === pianoStaffIds.left

            if (!isRightHand && !isLeftHand) return false
            if (handSelection === 'both') return true
            if (handSelection === 'right') return isRightHand
            if (handSelection === 'left') return isLeftHand
            return false
          })

          onNoteSelected(
            relevantNotes.map(n => ({
              name: n.note,
              midiNote: n.midi,
              duration: n.duration,
              isTieStart: n.isTieStart,
              staffId: n.staffId,
            })),
            { autoPlay: autoPlayEnabled, bpm: bpm },
          )
        }
        setCurrentEventIndex(index)
      },
      [scoreEvents, onNoteSelected, autoPlayEnabled, bpm, handSelection, pianoStaffIds],
    )

    // Fixed dependency: added syncToEvent
    useEffect(() => {
      if (scoreEvents.length > 0 && isLoaded) syncToEvent(0)
    }, [scoreEvents, isLoaded, syncToEvent])

    const handleNextNote = useCallback(() => {
      if (scoreEvents.length === 0) return
      const nextIndex = currentEventIndex + 1
      if (nextIndex < scoreEvents.length) syncToEvent(nextIndex)
      else setIsPlaying(false)
    }, [scoreEvents, currentEventIndex, syncToEvent])

    // Fixed dependency: removed scoreEvents
    const handlePrevNote = useCallback(() => {
      const prevIndex = Math.max(0, currentEventIndex - 1)
      syncToEvent(prevIndex)
    }, [currentEventIndex, syncToEvent])

    const handleResetCursor = useCallback(() => {
      setIsPlaying(false)
      syncToEvent(0)
    }, [syncToEvent])

    const playNextStep = useCallback(() => {
      if (!isPlaying) return
      if (currentEventIndex >= scoreEvents.length - 1) {
        setIsPlaying(false)
        return
      }

      const currentEvent = scoreEvents[currentEventIndex]
      const durationInBeats = currentEvent.notes[0] ? currentEvent.notes[0].duration : 1
      const ms = durationInBeats * (60 / bpm) * 1000

      playbackTimeoutRef.current = setTimeout(() => handleNextNote(), ms)
    }, [currentEventIndex, scoreEvents, bpm, isPlaying, handleNextNote])

    useEffect(() => {
      if (isPlaying) playNextStep()
      return () => {
        if (playbackTimeoutRef.current) clearTimeout(playbackTimeoutRef.current)
      }
    }, [isPlaying, currentEventIndex, playNextStep])

    const togglePlay = () => setIsPlaying(prev => !prev)
    const handleBpmChange = e => setBpm(Math.min(300, Math.max(20, parseInt(e.target.value))))
    const toggleHorizontalMode = () => setHorizontalMode(prev => !prev)
    const handleScoreChange = e => {
      setSelectedScore(e.target.value)
      const data = SAMPLE_SCORES.find(s => s.id === e.target.value)
      if (data && onScoreChange) onScoreChange(data.url)
    }
    const handleFileUpload = e => {
      const file = e.target.files[0]
      if (
        file &&
        (file.name.endsWith('.xml') ||
          file.name.endsWith('.musicxml') ||
          file.name.endsWith('.mxl'))
      ) {
        onScoreChange(URL.createObjectURL(file))
        setSelectedScore('custom')
      } else alert('Invalid file')
    }
    const toggleAutoAdvance = () => {
      setAutoAdvanceEnabled(!autoAdvanceEnabled)
      if (onSettingsChange) onSettingsChange({ autoAdvance: !autoAdvanceEnabled })
    }
    const toggleAutoPlay = () => {
      setAutoPlayEnabled(!autoPlayEnabled)
      if (onSettingsChange) onSettingsChange({ autoPlay: !autoPlayEnabled })
    }
    const handleZoomIn = () => {
      const z = Math.min(zoom * 1.2, 3.0)
      setZoom(z)
      if (onZoomIn) onZoomIn(z)
    }
    const handleZoomOut = () => {
      const z = Math.max(zoom / 1.2, 0.5)
      setZoom(z)
      if (onZoomOut) onZoomOut(z)
    }

    useImperativeHandle(ref, () => ({
      next: handleNextNote,
      previous: handlePrevNote,
      reset: handleResetCursor,
      get autoAdvance() {
        return autoAdvanceEnabled
      },
    }))

    // Load Score
    const loadScore = useCallback(
      async url => {
        if (!osmdRef.current || !url) return
        setIsLoaded(false)
        setScoreLoaded(false)
        setError(null)
        setScoreEvents([])
        setCurrentEventIndex(0)
        try {
          const opts = {
            ...defaultOptions,
            pageFormat: 'Endless',
            autoResize: !horizontalMode,
            renderSingleHorizontalStaffline: horizontalMode,
          }
          osmdRef.current.setOptions(opts)
          await osmdRef.current.load(url)
          setScoreLoaded(true)

          if (osmdRef.current.IsReadyToRender()) {
            setTimeout(() => {
              if (osmdRef.current) {
                osmdRef.current.Zoom = zoomRef.current
                updateStaffVisibility()

                try {
                  osmdRef.current.render()
                } catch (err) {
                  logger.warn('Render warning inside loadScore', err)
                }

                try {
                  const events = parseScore(osmdRef.current)
                  setScoreEvents(events)
                  logger.info(`Loaded ${events.length} events`)
                } catch (e) {
                  logger.error('Score Parsing Failed', e)
                }
              }
            }, 50)
            setTimeout(() => {
              if (osmdRef.current) {
                try {
                  osmdRef.current.enableOrDisableCursors(true)
                  osmdRef.current.cursor.show()
                  setIsLoaded(true)
                } catch (e) {
                  logger.error('Cursor init failed', e)
                }
              }
            }, 100)
          }
        } catch (err) {
          logger.error('Score loading failed', err)
          setError('Failed to load sheet music')
        }
      },
      [horizontalMode, updateStaffVisibility],
    )

    // Init
    useEffect(() => {
      if (!osmdContainerRef.current) return
      const c = osmdContainerRef.current
      while (c.firstChild) c.removeChild(c.firstChild)
      try {
        c.style.width = '100%'
        const osmd = new OpenSheetMusicDisplay(c, {
          ...defaultOptions,
          renderSingleHorizontalStaffline: horizontalMode,
          pageFormat: 'Endless',
        })
        osmd.setLogLevel('warn')
        osmdRef.current = osmd
        setIsInitialized(true)
      } catch (e) {
        logger.error('OSMD Init failed', e)
        setError('Failed to initialize sheet music display')
      }
      return () => {
        if (osmdRef.current) osmdRef.current = null
        setIsInitialized(false)
      }
    }, [horizontalMode])

    useEffect(() => {
      if (isInitialized && osmdRef.current && scoreUrl) loadScore(scoreUrl)
    }, [scoreUrl, loadScore, isInitialized])

    // Zoom effect with fixed catch block
    useEffect(() => {
      if (osmdRef.current && isLoaded && scoreLoaded) {
        try {
          osmdRef.current.Zoom = zoom
          osmdRef.current.render()
        } catch (e) {
          logger.warn('Zoom update warning', e)
        }
      }
    }, [zoom, isLoaded, scoreLoaded])

    return (
      <NotationDisplayContainer>
        {error && <div className="error-message">{error}</div>}
        {!isLoaded && !error && <div className="loading-message">Loading sheet music...</div>}
        <ControlsContainer>
          <ZoomControls>
            <Button onClick={handleZoomOut}>-</Button>
            <ZoomLevel>{Math.round(zoom * 100)}%</ZoomLevel>
            <Button onClick={handleZoomIn}>+</Button>
          </ZoomControls>
          <ScoreSelectorControls>
            <SelectorLabel>Score:</SelectorLabel>
            <Select value={selectedScore} onChange={handleScoreChange}>
              {SAMPLE_SCORES.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
              {selectedScore === 'custom' && <option value="custom">Custom</option>}
            </Select>
            <UploadButton>
              Upload
              <FileInput type="file" accept=".xml,.musicxml,.mxl" onChange={handleFileUpload} />
            </UploadButton>
          </ScoreSelectorControls>
          <CursorControls>
            <NavigationButton onClick={handleResetCursor} disabled={!isLoaded}>
              Reset
            </NavigationButton>
            <TempoControl>
              <label>BPM:</label>
              <input type="number" value={bpm} onChange={handleBpmChange} min="20" max="300" />
            </TempoControl>
            <PlayButton onClick={togglePlay} disabled={!isLoaded} $isPlaying={isPlaying}>
              {isPlaying ? 'Stop' : 'Play'}
            </PlayButton>
            <NavigationButton onClick={handlePrevNote} disabled={!isLoaded}>
              Prev
            </NavigationButton>
            <NavigationButton onClick={handleNextNote} disabled={!isLoaded}>
              Next
            </NavigationButton>
            <SettingsContainer>
              <SettingsToggle>
                <input type="checkbox" checked={autoAdvanceEnabled} onChange={toggleAutoAdvance} />
                <label>Auto-adv</label>
              </SettingsToggle>
              <SettingsToggle>
                <input type="checkbox" checked={autoPlayEnabled} onChange={toggleAutoPlay} />
                <label>Sound</label>
              </SettingsToggle>
              <SettingsToggle>
                <input type="checkbox" checked={horizontalMode} onChange={toggleHorizontalMode} />
                <label>Horiz.</label>
              </SettingsToggle>
            </SettingsContainer>
          </CursorControls>
        </ControlsContainer>
        <HorizontalScrollContainer>
          <NotationCanvas ref={osmdContainerRef} />
        </HorizontalScrollContainer>
      </NotationDisplayContainer>
    )
  },
)
NotationDisplay.displayName = 'NotationDisplay'
export default NotationDisplay
