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
  HorizontalScrollContainer,
} from './NotationDisplay.styles'

/**
 * Converts a MIDI note number to a standard notation note name
 * @param {number} midiNote - MIDI note number (0-127)
 * @returns {string} Note name in standard notation (e.g., "C4", "F#5")
 */
const midiNoteToNoteName = midiNote => {
  if (midiNote === undefined || midiNote === null) {
    console.warn('Invalid MIDI note number')
    return 'C4' // Default to middle C
  }

  // Note names with sharps
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

  // The standard formula to convert MIDI to octave
  // MIDI 60 = C4 (Middle C)
  let octave = Math.floor(midiNote / 12) - 1

  // Adjust octave for playability if needed
  if (octave < 1) {
    // If too low, transpose up to a playable range
    const octavesUp = Math.ceil(1 - octave)
    octave += octavesUp
    console.warn(`Note too low, transposing up ${octavesUp} octaves`)
  } else if (octave > 7) {
    // If too high, transpose down to a playable range
    const octavesDown = Math.ceil(octave - 7)
    octave -= octavesDown
    console.warn(`Note too high, transposing down ${octavesDown} octaves`)
  }

  // Calculate note name index (0-11)
  const noteIndex = midiNote % 12

  const noteName = noteNames[noteIndex] + octave
  console.warn(`Converted MIDI note ${midiNote} to ${noteName}`)

  return noteName
}

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
  'https://opensheetmusicdisplay.github.io/demo/sheets/MuzioClementi_SonatinaOpus36No1_Part1.xml'

const NotationDisplay = ({
  scoreUrl = DEFAULT_SCORE_URL,
  onNoteSelected,
  initialZoom = 1.0,
  onZoomIn,
  onZoomOut,
}) => {
  const osmdContainerRef = useRef(null)
  const osmdRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [zoom, setZoom] = useState(initialZoom)
  const [error, setError] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Use zoom from props if provided
  useEffect(() => {
    setZoom(initialZoom)
  }, [initialZoom])

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

        // Use horizontal scrolling for better viewing experience on wide screens
        if (osmdContainerRef.current) {
          osmdContainerRef.current.style.overflowX = 'auto'
          osmdContainerRef.current.style.width = '100%'
        }

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
      // Apply OSMD-specific styles
      container.style.maxWidth = '100%'
      container.style.width = '100%'

      // Create new OSMD instance
      const osmd = new OpenSheetMusicDisplay(container, {
        ...defaultOptions,
        pageFormat: 'Endless', // Using endless scrolling format for better display
        autoResize: true,
      })
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
    const newZoom = Math.min(zoom * 1.2, 3.0)
    setZoom(newZoom)
    if (onZoomIn) onZoomIn(newZoom)
  }

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom / 1.2, 0.5)
    setZoom(newZoom)
    if (onZoomOut) onZoomOut(newZoom)
  }

  // Function to safely extract note information with proper error handling
  const extractNotesInfo = notesUnderCursor => {
    try {
      // Log the raw notes
      console.warn(
        'Raw notes under cursor:',
        notesUnderCursor.map(n => {
          return {
            fundamentalNote: n.Pitch?.fundamentalNote,
            octave: n.Pitch?.octave,
            halfTone: n.Pitch?.halfTone,
            pitch: n.Pitch,
          }
        }),
      )

      const notes = notesUnderCursor
        .map(note => {
          // First check if note and note.Pitch exist
          if (!note || !note.Pitch) {
            return null
          }

          try {
            // Use the MIDI note number (halfTone) to get the accurate note name
            const midiNoteNumber = note.Pitch.halfTone
            if (midiNoteNumber === undefined) {
              console.warn('Note missing MIDI note number (halfTone)')
              return null
            }

            // Convert MIDI note to standard notation
            const noteName = midiNoteToNoteName(midiNoteNumber)

            // Use safe access for duration
            const duration = note.Length?.realValue || 0

            return {
              name: noteName,
              duration: duration,
              midiNote: midiNoteNumber,
            }
          } catch (err) {
            console.warn('Error extracting note details:', err)
            return null
          }
        })
        .filter(Boolean) // Remove any nulls from the array

      console.warn('Extracted notes info:', notes)
      return notes
    } catch (err) {
      console.error('Error processing notes:', err)
      return []
    }
  }

  const handleNextNote = () => {
    if (!osmdRef.current?.cursor || !isLoaded) return

    try {
      osmdRef.current.cursor.next()
      const notesUnderCursor = osmdRef.current.cursor.NotesUnderCursor()

      if (notesUnderCursor?.length > 0 && onNoteSelected) {
        const notes = extractNotesInfo(notesUnderCursor)
        if (notes.length > 0) {
          onNoteSelected(notes)
        }
      }
    } catch (err) {
      console.error('Error navigating to next note:', err)
    }
  }

  const handlePrevNote = () => {
    if (!osmdRef.current?.cursor || !isLoaded) return

    try {
      osmdRef.current.cursor.previous()
      const notesUnderCursor = osmdRef.current.cursor.NotesUnderCursor()

      if (notesUnderCursor?.length > 0 && onNoteSelected) {
        const notes = extractNotesInfo(notesUnderCursor)
        if (notes.length > 0) {
          onNoteSelected(notes)
        }
      }
    } catch (err) {
      console.error('Error navigating to previous note:', err)
    }
  }

  const handleResetCursor = () => {
    if (osmdRef.current?.cursor && isLoaded) {
      try {
        osmdRef.current.cursor.reset()
      } catch (err) {
        console.error('Error resetting cursor:', err)
      }
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

      <HorizontalScrollContainer>
        <NotationCanvas ref={osmdContainerRef} />
      </HorizontalScrollContainer>
    </NotationDisplayContainer>
  )
}

export default NotationDisplay
