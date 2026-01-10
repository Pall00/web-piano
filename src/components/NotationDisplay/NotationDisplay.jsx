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

// Configuration options for the OpenSheetMusicDisplay library
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
    },
    ref,
  ) => {
    // References for OSMD instance and DOM container
    const osmdContainerRef = useRef(null)
    const osmdRef = useRef(null)
    const playbackTimeoutRef = useRef(null)

    // Component State
    const [isLoaded, setIsLoaded] = useState(false)
    const [zoom, setZoom] = useState(initialZoom)

    // Zoom Ref - Prevents unnecessary re-runs of loadScore when zooming
    const zoomRef = useRef(zoom)
    useEffect(() => {
      zoomRef.current = zoom
    }, [zoom])

    const [error, setError] = useState(null)
    const [isInitialized, setIsInitialized] = useState(false)
    const [selectedScore, setSelectedScore] = useState(SAMPLE_SCORES[0].id)
    const [scoreLoaded, setScoreLoaded] = useState(false)

    // Parsed Score Data State
    const [scoreEvents, setScoreEvents] = useState([])
    const [currentEventIndex, setCurrentEventIndex] = useState(0)

    // User Settings
    const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(true)
    const [autoPlayEnabled, setAutoPlayEnabled] = useState(true)
    const [horizontalMode, setHorizontalMode] = useState(false)

    // Playback State
    const [isPlaying, setIsPlaying] = useState(false)
    const [bpm, setBpm] = useState(100)

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (playbackTimeoutRef.current) {
          clearTimeout(playbackTimeoutRef.current)
        }
      }
    }, [])

    // Clear playback timeout if playback stops
    useEffect(() => {
      if (!isPlaying && playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current)
        playbackTimeoutRef.current = null
      }
    }, [isPlaying])

    /**
     * CORE LOGIC: Synchronizes the visual cursor with the application state.
     * Moves the OSMD cursor to the timestamp matching the current event index.
     */
    const syncToEvent = useCallback(
      index => {
        if (!scoreEvents || scoreEvents.length === 0) return
        if (index < 0 || index >= scoreEvents.length) return

        const targetEvent = scoreEvents[index]
        const osmd = osmdRef.current

        if (osmd && osmd.cursor) {
          try {
            osmd.cursor.reset()
            const iterator = osmd.cursor.Iterator

            // Advance cursor until we reach the target timestamp (with small float tolerance)
            while (
              !iterator.EndReached &&
              iterator.CurrentSourceTimestamp.RealValue < targetEvent.timestamp - 0.001
            ) {
              osmd.cursor.next()
            }

            osmd.cursor.update()
          } catch (err) {
            logger.warn('Cursor sync warning:', err)
          }
        }

        // Notify parent component about the selected note
        if (onNoteSelected) {
          const cleanNotes = targetEvent.notes.map(n => ({
            name: n.note,
            midiNote: n.midi,
            duration: n.duration, // Duration in beats
            isTied: n.isTied,
          }))

          onNoteSelected(cleanNotes, {
            autoPlay: autoPlayEnabled,
            bpm: bpm,
          })
        }

        setCurrentEventIndex(index)
      },
      [scoreEvents, onNoteSelected, autoPlayEnabled, bpm],
    )

    // Effect: Reset cursor to start when new data is loaded
    useEffect(() => {
      if (scoreEvents.length > 0 && isLoaded) {
        syncToEvent(0)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scoreEvents, isLoaded])

    // Navigation Handlers
    const handleNextNote = useCallback(() => {
      if (scoreEvents.length === 0) return
      const nextIndex = currentEventIndex + 1
      if (nextIndex < scoreEvents.length) {
        syncToEvent(nextIndex)
      } else {
        setIsPlaying(false)
      }
    }, [scoreEvents, currentEventIndex, syncToEvent])

    const handlePrevNote = useCallback(() => {
      if (scoreEvents.length === 0) return
      const prevIndex = Math.max(0, currentEventIndex - 1)
      syncToEvent(prevIndex)
    }, [scoreEvents, currentEventIndex, syncToEvent])

    const handleResetCursor = useCallback(() => {
      setIsPlaying(false)
      syncToEvent(0)
    }, [syncToEvent])

    // --- PLAYBACK LOGIC ---

    // recursive function to handle playback timing
    const playNextStep = useCallback(() => {
      if (!isPlaying) return

      if (currentEventIndex >= scoreEvents.length - 1) {
        setIsPlaying(false)
        return
      }

      const currentEvent = scoreEvents[currentEventIndex]
      const durationInBeats = currentEvent.notes[0].duration
      const ms = durationInBeats * (60 / bpm) * 1000

      playbackTimeoutRef.current = setTimeout(() => {
        handleNextNote()
      }, ms)
    }, [currentEventIndex, scoreEvents, bpm, isPlaying, handleNextNote])

    // Trigger playback loop
    useEffect(() => {
      if (isPlaying) {
        playNextStep()
      }
      return () => {
        if (playbackTimeoutRef.current) clearTimeout(playbackTimeoutRef.current)
      }
    }, [isPlaying, currentEventIndex, playNextStep])

    const togglePlay = () => {
      setIsPlaying(prev => {
        if (!prev) {
          // If at the end, restart from beginning
          if (currentEventIndex >= scoreEvents.length - 1) {
            syncToEvent(0)
          }
        }
        return !prev
      })
    }

    const handleBpmChange = e => {
      let val = parseInt(e.target.value)
      if (val < 20) val = 20
      if (val > 300) val = 300
      setBpm(val)
    }

    // Expose methods to parent component via ref
    useImperativeHandle(ref, () => ({
      next: handleNextNote,
      previous: handlePrevNote,
      reset: handleResetCursor,
      get autoAdvance() {
        return autoAdvanceEnabled
      },
    }))

    // Sync zoom state (does not trigger reload)
    useEffect(() => {
      setZoom(initialZoom)
    }, [initialZoom])

    /**
     * Loads the score from URL, renders it, and parses events.
     */
    const loadScore = useCallback(
      async url => {
        if (!osmdRef.current || !url) return
        setIsLoaded(false)
        setScoreLoaded(false)
        setError(null)
        setScoreEvents([])
        setCurrentEventIndex(0)

        try {
          // Calculate container width for responsive rendering
          let containerWidth = 800
          if (osmdContainerRef.current?.parentElement) {
            containerWidth = osmdContainerRef.current.parentElement.clientWidth - 20
          }

          const options = {
            ...defaultOptions,
            pageFormat: 'Endless',
            autoResize: !horizontalMode,
            renderSingleHorizontalStaffline: horizontalMode,
          }
          if (horizontalMode && osmdRef.current.EngravingRules) {
            osmdRef.current.EngravingRules.PageWidth = containerWidth
          }

          osmdRef.current.setOptions(options)

          await osmdRef.current.load(url)
          setScoreLoaded(true)

          // Adjust container styles based on mode
          if (osmdContainerRef.current) {
            osmdContainerRef.current.style.width = horizontalMode ? containerWidth + 'px' : '100%'
            osmdContainerRef.current.style.overflowX = horizontalMode ? 'visible' : 'auto'
            if (horizontalMode) osmdContainerRef.current.parentElement.style.overflowX = 'auto'
          }

          if (osmdRef.current.IsReadyToRender()) {
            // First timeout: Render and Parse
            setTimeout(() => {
              if (osmdRef.current) {
                // Use Ref for zoom to avoid dependency loop
                osmdRef.current.Zoom = zoomRef.current
                osmdRef.current.render()

                // --- PARSER ---
                try {
                  const events = parseScore(osmdRef.current)
                  setScoreEvents(events)
                  logger.info(`Score loaded and parsed: ${events.length} events`)
                } catch (parseError) {
                  logger.error('ScoreParser failed:', parseError)
                }
              }
            }, 50)

            // Second timeout: Initialize Cursors and finalize loading state
            setTimeout(() => {
              if (osmdRef.current) {
                try {
                  osmdRef.current.enableOrDisableCursors(true)
                  osmdRef.current.cursor.show()
                } catch (err) {
                  ;('enable cursor error:', err)
                }

                setIsLoaded(true)
              } else {
                setError('Score loaded but not ready to render')
              }
            }, 100) // FIX: Added closing brace, delay, and parenthesis
          } // FIX: Added closing brace for IsReadyToRender check
        } catch (err) {
          logger.error('Error loading score:', err)
          setError('Failed to load sheet music')
        }
      },
      [horizontalMode],
    )

    // Initialize OpenSheetMusicDisplay instance
    useEffect(() => {
      if (!osmdContainerRef.current) return
      const container = osmdContainerRef.current
      // Clear container before initializing
      while (container.firstChild) {
        container.removeChild(container.firstChild)
      }
      try {
        container.style.maxWidth = '100%'
        container.style.width = '100%'

        const osmd = new OpenSheetMusicDisplay(container, {
          ...defaultOptions,
          renderSingleHorizontalStaffline: horizontalMode,
          pageFormat: 'Endless',
        })
        osmd.setLogLevel('warn')
        osmdRef.current = osmd
        setIsInitialized(true)
      } catch (err) {
        logger.error('Error initializing OSMD:', err)
        setError('Failed to initialize sheet music display')
      }
      return () => {
        if (osmdRef.current) osmdRef.current = null
        setIsInitialized(false)
      }
    }, [horizontalMode])

    // Effect: Trigger score load when URL or Init state changes
    useEffect(() => {
      if (isInitialized && osmdRef.current && scoreUrl) {
        loadScore(scoreUrl)
      }
    }, [scoreUrl, loadScore, isInitialized])

    // Effect: Handle Zoom updates (renders only, no reload)
    useEffect(() => {
      if (osmdRef.current && isLoaded && scoreLoaded) {
        try {
          if (osmdRef.current.IsReadyToRender()) {
            osmdRef.current.Zoom = zoom
            osmdRef.current.render()
          }
        } catch (err) {
          ;('error updating zoom:', err)
        }
      }
    }, [zoom, isLoaded, scoreLoaded])

    // --- UI Handlers ---

    const handleZoomIn = () => {
      const newZoom = Math.min(zoom * 1.2, 3.0)
      setZoom(newZoom)
      if (onZoomIn) onZoomIn(newZoom)
    }

    const handleZoomOut = () => {
      const newZoom = Math.max(zoom / 1.2, 0.5)
      setZoom(newZoom)
      if (onZoomOut) onZoomOut(newZoom)
    }

    const toggleAutoAdvance = () => {
      const newValue = !autoAdvanceEnabled
      setAutoAdvanceEnabled(newValue)
      if (onSettingsChange) onSettingsChange({ autoAdvance: newValue })
    }

    const toggleAutoPlay = () => {
      const newValue = !autoPlayEnabled
      setAutoPlayEnabled(newValue)
      if (onSettingsChange) onSettingsChange({ autoPlay: newValue })
    }

    const toggleHorizontalMode = () => {
      setHorizontalMode(prev => !prev)
    }

    const handleScoreChange = e => {
      const scoreId = e.target.value
      setSelectedScore(scoreId)
      const selectedScoreData = SAMPLE_SCORES.find(score => score.id === scoreId)
      if (selectedScoreData && onScoreChange) {
        onScoreChange(selectedScoreData.url)
      }
    }

    const handleFileUpload = e => {
      const file = e.target.files[0]
      if (!file) return
      if (
        file.name.endsWith('.xml') ||
        file.name.endsWith('.musicxml') ||
        file.name.endsWith('.mxl')
      ) {
        const fileUrl = URL.createObjectURL(file)
        if (onScoreChange) onScoreChange(fileUrl)
        setSelectedScore('custom')
      } else {
        alert('Please upload a MusicXML file (.xml, .musicxml, or .mxl)')
      }
    }

    return (
      <NotationDisplayContainer>
        {error && <div className="error-message">{error}</div>}
        {!isLoaded && !error && <div className="loading-message">Loading sheet music...</div>}

        <ControlsContainer>
          <ZoomControls>
            <Button onClick={handleZoomOut} title="Zoom Out">
              <span className="icon">-</span>
            </Button>
            <ZoomLevel>{Math.round(zoom * 100)}%</ZoomLevel>
            <Button onClick={handleZoomIn} title="Zoom In">
              <span className="icon">+</span>
            </Button>
          </ZoomControls>

          <ScoreSelectorControls>
            <SelectorLabel>Score:</SelectorLabel>
            <Select value={selectedScore} onChange={handleScoreChange}>
              {SAMPLE_SCORES.map(score => (
                <option key={score.id} value={score.id}>
                  {score.name}
                </option>
              ))}
              {selectedScore === 'custom' && <option value="custom">Custom Upload</option>}
            </Select>

            <UploadButton>
              Upload
              <FileInput type="file" accept=".xml,.musicxml,.mxl" onChange={handleFileUpload} />
            </UploadButton>
          </ScoreSelectorControls>

          <CursorControls>
            <NavigationButton
              onClick={handleResetCursor}
              disabled={!isLoaded}
              title="Reset to Start"
            >
              Reset
            </NavigationButton>

            <TempoControl>
              <label>BPM:</label>
              <input
                type="number"
                value={bpm}
                onChange={handleBpmChange}
                min="20"
                max="300"
                title="Beats Per Minute"
              />
            </TempoControl>

            <PlayButton
              onClick={togglePlay}
              disabled={!isLoaded}
              $isPlaying={isPlaying}
              title={isPlaying ? 'Stop Playback' : 'Start Playback'}
            >
              {isPlaying ? 'Stop' : 'Play'}
            </PlayButton>

            <NavigationButton onClick={handlePrevNote} disabled={!isLoaded} title="Previous Note">
              Prev
            </NavigationButton>
            <NavigationButton onClick={handleNextNote} disabled={!isLoaded} title="Next Note">
              Next
            </NavigationButton>

            <SettingsContainer>
              <SettingsToggle>
                <input
                  type="checkbox"
                  id="auto-advance"
                  checked={autoAdvanceEnabled}
                  onChange={toggleAutoAdvance}
                />
                <label htmlFor="auto-advance">Auto-adv</label>
              </SettingsToggle>

              <SettingsToggle>
                <input
                  type="checkbox"
                  id="auto-play"
                  checked={autoPlayEnabled}
                  onChange={toggleAutoPlay}
                />
                <label htmlFor="auto-play">Sound</label>
              </SettingsToggle>

              <SettingsToggle>
                <input
                  type="checkbox"
                  id="horizontal-mode"
                  checked={horizontalMode}
                  onChange={toggleHorizontalMode}
                />
                <label htmlFor="horizontal-mode">Horiz.</label>
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
