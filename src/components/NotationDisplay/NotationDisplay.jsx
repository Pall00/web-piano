import { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react'
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay'
import { SAMPLE_SCORES } from '../../data/scoreData'
import logger from '../../utils/logger'
import { extractNotesInfo } from '../../utils/osmdHelpers'
import {
  NotationDisplayContainer,
  NotationCanvas,
  ControlsContainer,
  ZoomControls,
  ScoreSelectorControls,
  CursorControls,
  Button,
  NavigationButton,
  ZoomLevel,
  HorizontalScrollContainer,
  Select,
  SelectorLabel,
  UploadButton,
  FileInput,
  SettingsToggle,
  SettingsContainer,
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
    },
    ref,
  ) => {
    const osmdContainerRef = useRef(null)
    const osmdRef = useRef(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const [zoom, setZoom] = useState(initialZoom)
    const [error, setError] = useState(null)
    const [isInitialized, setIsInitialized] = useState(false)
    const [selectedScore, setSelectedScore] = useState(SAMPLE_SCORES[0].id)
    const [scoreLoaded, setScoreLoaded] = useState(false)

    // Asetukset
    const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(true)
    const [autoPlayEnabled, setAutoPlayEnabled] = useState(true)
    const [horizontalMode, setHorizontalMode] = useState(false)

    // Nuottien käsittelylogiikka (DRY: käytetään next/prev/reset toiminnoissa)
    const processCursorNotes = useCallback(() => {
      if (!osmdRef.current?.cursor) return

      const notesUnderCursor = osmdRef.current.cursor.NotesUnderCursor()

      if (notesUnderCursor?.length > 0) {
        const notes = extractNotesInfo(notesUnderCursor)

        if (notes.length > 0) {
          // Jos kaikki nuotit ovat sidottuja, siirry automaattisesti
          const allTied = notes.every(note => note.isTied)

          if (allTied) {
            // Pieni viive renderöinnin varmistamiseksi
            setTimeout(() => {
              handleNextNote()
            }, 10)
          } else {
            if (onNoteSelected) {
              onNoteSelected(notes, { autoPlay: autoPlayEnabled })
            }
          }
        }
      }
    }, [onNoteSelected, autoPlayEnabled])

    // Navigointifunktiot
    const handleNextNote = useCallback(() => {
      if (!osmdRef.current || !isLoaded) return
      try {
        if (!osmdRef.current.cursor) return
        osmdRef.current.cursor.next()
        processCursorNotes()
      } catch (err) {
        logger.error('Error navigating next:', err)
      }
    }, [isLoaded, processCursorNotes])

    const handlePrevNote = useCallback(() => {
      if (!osmdRef.current || !isLoaded) return
      try {
        if (!osmdRef.current.cursor) return
        osmdRef.current.cursor.previous()
        processCursorNotes()
      } catch (err) {
        logger.error('Error navigating prev:', err)
      }
    }, [isLoaded, processCursorNotes])

    const handleResetCursor = useCallback(() => {
      if (!osmdRef.current || !isLoaded) return
      try {
        if (!osmdRef.current.cursor) return
        osmdRef.current.cursor.reset()
        processCursorNotes()
      } catch (err) {
        logger.error('Error resetting cursor:', err)
      }
    }, [isLoaded, processCursorNotes])

    // Tarjotaan funktiot parent-komponentille ref:n kautta
    useImperativeHandle(ref, () => ({
      next: handleNextNote,
      previous: handlePrevNote,
      reset: handleResetCursor,
      get autoAdvance() {
        return autoAdvanceEnabled
      },
    }))

    // Zoom synkronointi propsista
    useEffect(() => {
      setZoom(initialZoom)
    }, [initialZoom])

    // Score loading logic
    const loadScore = useCallback(
      async url => {
        if (!osmdRef.current || !url) return

        setIsLoaded(false)
        setScoreLoaded(false)
        setError(null)

        try {
          let containerWidth = 800
          if (osmdContainerRef.current?.parentElement) {
            containerWidth = osmdContainerRef.current.parentElement.clientWidth - 20
          }

          // Asetukset horizontal mode huomioiden
          if (horizontalMode) {
            osmdRef.current.setOptions({
              ...defaultOptions,
              renderSingleHorizontalStaffline: true,
              autoResize: false,
              pageFormat: 'Endless',
            })
            if (osmdRef.current.EngravingRules) {
              osmdRef.current.EngravingRules.PageWidth = containerWidth
            }
          } else {
            osmdRef.current.setOptions({
              ...defaultOptions,
              renderSingleHorizontalStaffline: false,
              autoResize: true,
              pageFormat: 'Endless',
            })
          }

          await osmdRef.current.load(url)
          setScoreLoaded(true)

          // Container tyylit
          if (osmdContainerRef.current) {
            if (horizontalMode) {
              osmdContainerRef.current.style.width = containerWidth + 'px'
              osmdContainerRef.current.style.overflowX = 'visible'
              osmdContainerRef.current.parentElement.style.overflowX = 'auto'
            } else {
              osmdContainerRef.current.style.width = '100%'
              osmdContainerRef.current.style.overflowX = 'auto'
            }
          }

          if (osmdRef.current.IsReadyToRender()) {
            setTimeout(() => {
              if (osmdRef.current) {
                osmdRef.current.Zoom = zoom
                osmdRef.current.render()
              }
            }, 50)

            // Kursorin alustus viiveellä
            setTimeout(() => {
              if (osmdRef.current) {
                try {
                  if (!osmdRef.current.cursor) {
                    osmdRef.current.enableOrDisableCursors(true)
                  }
                  if (osmdRef.current.cursor) {
                    osmdRef.current.cursor.show()
                  }
                } catch (err) {
                  logger.warn('Error setting up cursor:', err)
                }
              }
            }, 100)

            setIsLoaded(true)
          } else {
            setError('Score loaded but not ready to render')
          }
        } catch (err) {
          logger.error('Error loading score:', err)
          setError('Failed to load sheet music')
        }
      },
      [zoom, horizontalMode],
    )

    // OSMD alustus
    useEffect(() => {
      if (!osmdContainerRef.current) return

      const container = osmdContainerRef.current
      while (container.firstChild) {
        container.removeChild(container.firstChild)
      }

      try {
        container.style.maxWidth = '100%'
        container.style.width = '100%'

        if (horizontalMode) {
          const parentWidth = container.parentElement ? container.parentElement.clientWidth : 800
          const osmd = new OpenSheetMusicDisplay(container, {
            ...defaultOptions,
            renderSingleHorizontalStaffline: true,
            pageFormat: 'Endless',
            autoResize: false,
            width: parentWidth - 20,
          })
          osmd.setLogLevel('warn')
          osmdRef.current = osmd
        } else {
          const osmd = new OpenSheetMusicDisplay(container, {
            ...defaultOptions,
            renderSingleHorizontalStaffline: false,
            pageFormat: 'Endless',
            autoResize: true,
          })
          osmd.setLogLevel('warn')
          osmdRef.current = osmd
        }

        setIsInitialized(true)
      } catch (err) {
        logger.error('Error initializing OSMD:', err)
        setError('Failed to initialize sheet music display')
      }

      return () => {
        if (osmdRef.current) osmdRef.current = null
        if (container) {
          while (container.firstChild) container.removeChild(container.firstChild)
        }
        setIsInitialized(false)
      }
    }, [horizontalMode])

    // Lataa nuotti kun alustettu
    useEffect(() => {
      if (isInitialized && osmdRef.current && scoreUrl) {
        loadScore(scoreUrl)
      }
    }, [scoreUrl, loadScore, isInitialized])

    // Zoom päivitys
    useEffect(() => {
      if (osmdRef.current && isLoaded && scoreLoaded) {
        try {
          if (osmdRef.current.IsReadyToRender()) {
            osmdRef.current.Zoom = zoom
            osmdRef.current.render()
          }
        } catch (err) {
          logger.error('Error applying zoom:', err)
        }
      }
    }, [zoom, isLoaded, scoreLoaded])

    const handleZoomIn = () => {
      if (osmdRef.current && isLoaded && scoreLoaded) {
        const newZoom = Math.min(zoom * 1.2, 3.0)
        setZoom(newZoom)
        if (onZoomIn) onZoomIn(newZoom)
      }
    }

    const handleZoomOut = () => {
      if (osmdRef.current && isLoaded && scoreLoaded) {
        const newZoom = Math.max(zoom / 1.2, 0.5)
        setZoom(newZoom)
        if (onZoomOut) onZoomOut(newZoom)
      }
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
            <Button onClick={handleZoomOut}>
              <span className="icon">-</span>
            </Button>
            <ZoomLevel>{Math.round(zoom * 100)}%</ZoomLevel>
            <Button onClick={handleZoomIn}>
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
            <NavigationButton onClick={handleResetCursor} disabled={!isLoaded}>
              Reset
            </NavigationButton>
            <NavigationButton onClick={handlePrevNote} disabled={!isLoaded}>
              Previous
            </NavigationButton>
            <NavigationButton onClick={handleNextNote} disabled={!isLoaded}>
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
                <label htmlFor="auto-advance">Auto-advance</label>
              </SettingsToggle>

              <SettingsToggle>
                <input
                  type="checkbox"
                  id="auto-play"
                  checked={autoPlayEnabled}
                  onChange={toggleAutoPlay}
                />
                <label htmlFor="auto-play">Auto-play notes</label>
              </SettingsToggle>

              <SettingsToggle>
                <input
                  type="checkbox"
                  id="horizontal-mode"
                  checked={horizontalMode}
                  onChange={toggleHorizontalMode}
                />
                <label htmlFor="horizontal-mode">Horizontal mode</label>
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
