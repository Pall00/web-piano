// src/components/NotationDisplay/NotationDisplay.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay'
import { SAMPLE_SCORES } from '../../data/scoreData'
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
  // Add horizontal mode option (controlled by state)
  renderSingleHorizontalStaffline: false,
  // Set a neutral backend that will work in all browsers
  backend: 'svg',
}

const NotationDisplay = ({
  scoreUrl = DEFAULT_SCORE_URL,
  onNoteSelected,
  initialZoom = 1.0,
  onZoomIn,
  onZoomOut,
  onScoreChange,
  onSettingsChange,
}) => {
  const osmdContainerRef = useRef(null)
  const osmdRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [zoom, setZoom] = useState(initialZoom)
  const [error, setError] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [selectedScore, setSelectedScore] = useState(SAMPLE_SCORES[0].id)

  // Add settings state
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(true)
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true)
  // Add horizontal mode state
  const [horizontalMode, setHorizontalMode] = useState(false)

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
        // Calculate container width for horizontal mode
        let containerWidth = 800 // Default fallback width
        if (osmdContainerRef.current) {
          const parentElement = osmdContainerRef.current.parentElement
          if (parentElement) {
            containerWidth = parentElement.clientWidth - 20 // Leave a small margin
          }
        }

        // Update options based on horizontal mode setting
        if (horizontalMode) {
          osmdRef.current.setOptions({
            ...defaultOptions,
            renderSingleHorizontalStaffline: true,
            autoResize: false,
            pageFormat: 'Endless',
          })

          // Set explicit width for horizontal mode
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

        // IMPORTANT: Only set zoom and render after successful load
        osmdRef.current.zoom = zoom

        // Force container styling
        if (osmdContainerRef.current) {
          if (horizontalMode) {
            // For horizontal mode, control overflow
            osmdContainerRef.current.style.width = containerWidth + 'px'
            osmdContainerRef.current.style.overflowX = 'visible'
            osmdContainerRef.current.parentElement.style.overflowX = 'auto'
          } else {
            // For vertical mode, allow content to determine dimensions
            osmdContainerRef.current.style.width = '100%'
            osmdContainerRef.current.style.overflowX = 'auto'
          }
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
    [zoom, horizontalMode],
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

      // Set a fixed width for horizontal mode to maintain scrollability
      if (horizontalMode) {
        // Use the parent container's width for rendering
        // This ensures we don't expand beyond the screen width
        const parentWidth = container.parentElement.clientWidth

        // Create new OSMD instance with fixed width
        const osmd = new OpenSheetMusicDisplay(container, {
          ...defaultOptions,
          renderSingleHorizontalStaffline: true,
          pageFormat: 'Endless',
          autoResize: false, // Disable auto resize to maintain our dimensions
          width: parentWidth - 20, // Leave a small margin
        })
        osmd.setLogLevel('warn')
        osmdRef.current = osmd
      } else {
        // Standard vertical rendering
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
  }, [horizontalMode]) // Add horizontalMode as a dependency

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

  /**
   * Converts a frequency in Hz to a note name
   * @param {number} frequency - The frequency in Hz
   * @returns {string} Note name in the format of letter, accidental, and octave (e.g., "C4", "F#5")
   */
  const frequencyToNoteName = frequency => {
    try {
      if (!frequency || frequency <= 0) {
        console.warn('Invalid frequency:', frequency)
        return null
      }

      // A4 = 440 Hz
      const A4 = 440.0

      // Calculate how many semitones away from A4
      // Formula: 12 * log2(f / 440)
      const semitoneOffset = 12 * Math.log2(frequency / A4)

      // Round to the nearest semitone
      const semitones = Math.round(semitoneOffset)

      // Calculate MIDI note number (A4 is MIDI note 69)
      const midiNote = 69 + semitones

      // Convert MIDI note number to note name
      return midiNoteToNoteName(midiNote)
    } catch (err) {
      console.error('Error converting frequency to note name:', err)
      return null
    }
  }

  // Function to safely extract note information with proper error handling
  const extractNotesInfo = notesUnderCursor => {
    try {
      if (notesUnderCursor.length > 0) {
        console.warn('Processing notes under cursor:', notesUnderCursor.length)
      }

      const notes = notesUnderCursor
        .map(note => {
          if (!note) return null

          try {
            // Check for TransposedPitch first (if sheet is transposed)
            // Then fall back to regular Pitch
            const pitchObj = note.TransposedPitch || note.Pitch

            if (!pitchObj) {
              console.warn('Note missing pitch information')
              return null
            }

            let noteName = null

            // Try frequency first - most reliable method
            if (pitchObj.frequency && pitchObj.frequency > 0) {
              noteName = frequencyToNoteName(pitchObj.frequency)
              console.warn(`Using frequency (${pitchObj.frequency} Hz) → ${noteName}`)
            }

            // If frequency conversion failed, try MIDI
            if (!noteName && pitchObj.halfTone !== undefined) {
              const midiNoteNumber = pitchObj.halfTone
              noteName = midiNoteToNoteName(midiNoteNumber)
              console.warn(`Using MIDI conversion (${midiNoteNumber}) → ${noteName}`)
            }

            // Use safe access for duration
            const duration = note.Length?.realValue || 0

            if (!noteName) {
              console.warn('Could not determine note name')
              return null
            }

            return {
              name: noteName,
              duration: duration,
              midiNote: pitchObj.halfTone,
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

  const handleNextNote = useCallback(() => {
    if (!osmdRef.current?.cursor || !isLoaded) return

    try {
      osmdRef.current.cursor.next()
      const notesUnderCursor = osmdRef.current.cursor.NotesUnderCursor()

      if (notesUnderCursor?.length > 0 && onNoteSelected) {
        const notes = extractNotesInfo(notesUnderCursor)
        if (notes.length > 0) {
          onNoteSelected(notes, { autoPlay: autoPlayEnabled })
        }
      }
    } catch (err) {
      console.error('Error navigating to next note:', err)
    }
  }, [onNoteSelected, autoPlayEnabled])

  const handlePrevNote = useCallback(() => {
    if (!osmdRef.current?.cursor || !isLoaded) return

    try {
      osmdRef.current.cursor.previous()
      const notesUnderCursor = osmdRef.current.cursor.NotesUnderCursor()

      if (notesUnderCursor?.length > 0 && onNoteSelected) {
        const notes = extractNotesInfo(notesUnderCursor)
        if (notes.length > 0) {
          onNoteSelected(notes, { autoPlay: autoPlayEnabled })
        }
      }
    } catch (err) {
      console.error('Error navigating to previous note:', err)
    }
  }, [onNoteSelected, autoPlayEnabled])

  const handleResetCursor = useCallback(() => {
    if (osmdRef.current?.cursor && isLoaded) {
      try {
        osmdRef.current.cursor.reset()
        // Get notes under cursor after reset
        const notesUnderCursor = osmdRef.current.cursor.NotesUnderCursor()

        if (notesUnderCursor?.length > 0 && onNoteSelected) {
          const notes = extractNotesInfo(notesUnderCursor)
          if (notes.length > 0) {
            onNoteSelected(notes, { autoPlay: autoPlayEnabled })
          }
        }
      } catch (err) {
        console.error('Error resetting cursor:', err)
      }
    }
  }, [onNoteSelected, autoPlayEnabled])

  // Toggle handlers for settings
  const toggleAutoAdvance = () => {
    const newValue = !autoAdvanceEnabled
    setAutoAdvanceEnabled(newValue)

    // Notify parent component of the change
    if (onSettingsChange) {
      onSettingsChange({ autoAdvance: newValue })
    }
  }

  const toggleAutoPlay = () => {
    const newValue = !autoPlayEnabled
    setAutoPlayEnabled(newValue)

    // Notify parent component of the change
    if (onSettingsChange) {
      onSettingsChange({ autoPlay: newValue })
    }
  }

  // Add toggle handler for horizontal mode
  const toggleHorizontalMode = () => {
    const newValue = !horizontalMode
    setHorizontalMode(newValue)

    // If OSMD is already initialized, update its options and reload the score
    if (osmdRef.current && isInitialized && scoreUrl) {
      // We'll reload the score to apply the new horizontal mode setting
      loadScore(scoreUrl)
    }
  }

  // Expose cursor control functions globally
  useEffect(() => {
    // Make cursor navigation functions accessible to other components
    window.notationCursor = {
      next: handleNextNote,
      previous: handlePrevNote,
      reset: handleResetCursor,
      autoAdvance: autoAdvanceEnabled,
    }

    // Cleanup on unmount
    return () => {
      window.notationCursor = null
    }
  }, [handleNextNote, handlePrevNote, handleResetCursor, autoAdvanceEnabled])

  // Handle score selection change
  const handleScoreChange = e => {
    const scoreId = e.target.value
    setSelectedScore(scoreId)

    const selectedScoreData = SAMPLE_SCORES.find(score => score.id === scoreId)
    if (selectedScoreData && onScoreChange) {
      onScoreChange(selectedScoreData.url)
    }
  }

  // Handle file upload
  const handleFileUpload = e => {
    const file = e.target.files[0]
    if (!file) return

    // Check if file is MusicXML
    if (
      file.name.endsWith('.xml') ||
      file.name.endsWith('.musicxml') ||
      file.name.endsWith('.mxl')
    ) {
      // Create a URL for the file
      const fileUrl = URL.createObjectURL(file)
      if (onScoreChange) {
        onScoreChange(fileUrl)
      }

      // Reset the select to a custom option
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

          {/* Settings toggles */}
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

            {/* Horizontal mode toggle */}
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
}

export default NotationDisplay
