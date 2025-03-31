// src/components/NotationDisplay/NotationDisplay.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay'
import {
  NotationDisplayContainer,
  NotationCanvas,
  ControlsContainer,
  ZoomControls,
  CursorControls,
  Button,
  NavigationButton,
  ZoomLevel,
} from './NotationDisplay.styles'

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
  // Set a neutral backend that will work in all browsers
  backend: 'svg',
}

// Default MusicXML to show if none provided
const DEFAULT_SCORE_URL =
  'https://opensheetmusicdisplay.github.io/demo/MuzioClementi_SonatinaOpus36No1_Part1.xml'

const NotationDisplay = ({ scoreUrl = DEFAULT_SCORE_URL, onNoteSelected, initialZoom = 1.0 }) => {
  const osmdContainerRef = useRef(null)
  const osmdRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [zoom, setZoom] = useState(initialZoom)
  const [error, setError] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Memoize the loadScore function to use in multiple effects
  const loadScore = useCallback(
    async url => {
      if (!osmdRef.current || !url) return

      setIsLoaded(false)
      setError(null)

      try {
        await osmdRef.current.load(url)

        // IMPORTANT: Only set zoom and render after successful load
        osmdRef.current.zoom = zoom

        // Check if we can render before trying
        if (osmdRef.current.IsReadyToRender()) {
          osmdRef.current.render()

          // Initialize cursor only after successful render
          if (!osmdRef.current.cursor) {
            osmdRef.current.enableOrDisableCursors(true)
          }

          // Show cursor
          if (osmdRef.current.cursor) {
            osmdRef.current.cursor.show()
          }

          setIsLoaded(true)
        } else {
          setError('Score loaded but not ready to render')
        }
      } catch (err) {
        console.error('Error loading score:', err)
        setError('Failed to load sheet music')
      }
    },
    [zoom],
  )

  // Initialize OSMD
  useEffect(() => {
    if (!osmdContainerRef.current) return

    // Store the current container reference to use in cleanup
    const container = osmdContainerRef.current

    // Clear any existing content
    while (container.firstChild) {
      container.removeChild(container.firstChild)
    }

    try {
      // Create new OSMD instance
      const osmd = new OpenSheetMusicDisplay(container, defaultOptions)
      osmd.setLogLevel('warn')
      osmdRef.current = osmd
      setIsInitialized(true)
    } catch (err) {
      console.error('Error initializing OSMD:', err)
      setError('Failed to initialize sheet music display')
    }

    return () => {
      // Clean up OSMD instance
      if (osmdRef.current) {
        // OSMD doesn't have a built-in dispose method, but we can at least
        // remove its elements from the DOM
        if (container) {
          while (container.firstChild) {
            container.removeChild(container.firstChild)
          }
        }
        osmdRef.current = null
      }
      setIsInitialized(false)
    }
  }, []) // This effect should only run once on mount

  // Load score when initialized and URL is available
  useEffect(() => {
    if (isInitialized && osmdRef.current && scoreUrl) {
      loadScore(scoreUrl)
    }
  }, [scoreUrl, loadScore, isInitialized])

  // Apply zoom when it changes
  useEffect(() => {
    if (osmdRef.current && isLoaded) {
      osmdRef.current.Zoom = zoom
      osmdRef.current.render()
    }
  }, [zoom, isLoaded])

  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom * 1.2, 3.0))
  }

  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom / 1.2, 0.5))
  }

  const handleNextNote = () => {
    if (osmdRef.current?.cursor && isLoaded) {
      osmdRef.current.cursor.next()
      const notesUnderCursor = osmdRef.current.cursor.NotesUnderCursor()

      if (notesUnderCursor.length > 0 && onNoteSelected) {
        // Extract pitch information
        const notes = notesUnderCursor
          .map(note => {
            const pitch = note.Pitch
            if (pitch) {
              return {
                // Format as C4, D#3, etc.
                name: `${pitch.Fundamental.toString().replace(',', '')}${pitch.Octave}`,
                // Can include more information if needed
                duration: note.Length.realValue,
              }
            }
            return null
          })
          .filter(Boolean)

        onNoteSelected(notes)
      }
    }
  }

  const handlePrevNote = () => {
    if (osmdRef.current?.cursor && isLoaded) {
      osmdRef.current.cursor.previous()

      const notesUnderCursor = osmdRef.current.cursor.NotesUnderCursor()

      if (notesUnderCursor.length > 0 && onNoteSelected) {
        // Same note extraction logic as in handleNextNote
        const notes = notesUnderCursor
          .map(note => {
            const pitch = note.Pitch
            if (pitch) {
              return {
                name: `${pitch.Fundamental.toString().replace(',', '')}${pitch.Octave}`,
                duration: note.Length.realValue,
              }
            }
            return null
          })
          .filter(Boolean)

        onNoteSelected(notes)
      }
    }
  }

  const handleResetCursor = () => {
    if (osmdRef.current?.cursor && isLoaded) {
      osmdRef.current.cursor.reset()
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
        </CursorControls>
      </ControlsContainer>

      <NotationCanvas ref={osmdContainerRef} />
    </NotationDisplayContainer>
  )
}

export default NotationDisplay
