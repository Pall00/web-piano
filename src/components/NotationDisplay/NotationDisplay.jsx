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
    },
    ref,
  ) => {
    const osmdContainerRef = useRef(null)
    const osmdRef = useRef(null)
    const playbackTimeoutRef = useRef(null) // Ref ajastimelle

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

    // Playback state
    const [isPlaying, setIsPlaying] = useState(false)
    const [bpm, setBpm] = useState(100)

    // Pysäytä soitto jos komponentti poistuu
    useEffect(() => {
      return () => {
        if (playbackTimeoutRef.current) {
          clearTimeout(playbackTimeoutRef.current)
        }
      }
    }, [])

    // Pysäytä soitto jos Play-tila muuttuu falseksi
    useEffect(() => {
      if (!isPlaying && playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current)
        playbackTimeoutRef.current = null
      }
    }, [isPlaying])

    // Nuottien käsittelylogiikka
    const processCursorNotes = useCallback(() => {
      if (!osmdRef.current?.cursor) return

      const notesUnderCursor = osmdRef.current.cursor.NotesUnderCursor()

      if (notesUnderCursor?.length > 0) {
        const notes = extractNotesInfo(notesUnderCursor)

        if (notes.length > 0) {
          // Jos nuotit sidottuja, automaattinen siirto (vain jos ei olla Play-moodissa, koska Play hoitaa ajoituksen itse)
          const allTied = notes.every(note => note.isTied)

          if (allTied && !isPlaying) {
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
    }, [onNoteSelected, autoPlayEnabled, isPlaying])

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
      setIsPlaying(false) // Pysäytä soitto resetissä
      try {
        if (!osmdRef.current.cursor) return
        osmdRef.current.cursor.reset()
        processCursorNotes()
      } catch (err) {
        logger.error('Error resetting cursor:', err)
      }
    }, [isLoaded, processCursorNotes])

    // --- PLAYBACK LOGIC START ---

    // Tämä funktio suorittaa yhden askeleen ja ajastaa seuraavan
    const playNextStep = useCallback(() => {
      if (!osmdRef.current?.cursor) {
        setIsPlaying(false)
        return
      }

      // Tarkista ollaanko lopussa
      if (osmdRef.current.cursor.Iterator.EndReached) {
        setIsPlaying(false)
        return
      }

      // 1. Soita nykyinen nuotti ja siirrä kursoria
      handleNextNote()

      // 2. Laske kesto seuraavaan iskuun
      // Haetaan nuotit, jotka ovat NYT kursorin alla (siirron jälkeen)
      const notesUnderCursor = osmdRef.current.cursor.NotesUnderCursor()

      let duration = 0.25 // Oletus: neljäsosanuotti

      if (notesUnderCursor && notesUnderCursor.length > 0) {
        // Otetaan ensimmäisen nuotin pituus. OSMD cursor etenee yleensä pienimmän aika-arvon mukaan.
        // Length.RealValue on esim 0.25 (1/4) tai 0.5 (1/2).
        const note = notesUnderCursor[0]
        if (note.Length && note.Length.RealValue) {
          duration = note.Length.RealValue
        }
      }

      // Laske millisekunnit: (Nuotin arvo * 4) * (60 / BPM) * 1000
      // Esim: 1/4 nuotti (0.25) * 4 = 1 isku. BPM 60 = 1 sekunti/isku. Tulos 1000ms.
      const ms = duration * 4 * (60 / bpm) * 1000

      // 3. Ajasta seuraava askel
      playbackTimeoutRef.current = setTimeout(() => {
        playNextStep()
      }, ms)
    }, [handleNextNote, bpm])

    const togglePlay = () => {
      if (isPlaying) {
        setIsPlaying(false)
        if (playbackTimeoutRef.current) clearTimeout(playbackTimeoutRef.current)
      } else {
        setIsPlaying(true)
        // Käynnistä looppi
        // Jos ollaan alussa (tai reset tehty), siirry heti ensimmäiseen.
        // Jos ollaan keskellä, jatka siitä.
        playNextStep()
      }
    }

    const handleBpmChange = e => {
      let val = parseInt(e.target.value)
      if (val < 20) val = 20
      if (val > 300) val = 300
      setBpm(val)
    }

    // --- PLAYBACK LOGIC END ---

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

    // Score loading logic (Pidetty ennallaan, mutta lyhennetty tässä vastauksessa tilan säästämiseksi.
    // Kopioi alkuperäisestä loadScore ja useEffect-osiot tähän jos ne puuttuvat,
    // mutta tässä keskitytään uusiin ominaisuuksiin.)

    // ... (loadScore ja OSMD alustus useEffectit säilyvät ennallaan) ...

    // Varmistetaan että loadScore ja muut efektit ovat olemassa (kopioi alkuperäisestä tiedostosta tähän väliin)
    // TÄSSÄ ON NOPEA KOPIO TARVITTAVISTA LOGIIKOISTA JOTTA KOODI TOIMII SUORAAN:
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

    useEffect(() => {
      if (isInitialized && osmdRef.current && scoreUrl) {
        loadScore(scoreUrl)
      }
    }, [scoreUrl, loadScore, isInitialized])

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
