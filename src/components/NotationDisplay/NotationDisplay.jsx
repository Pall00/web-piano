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

// Function to check if a note is tied (second note of a tie)
const isTiedNote = note => {
  try {
    // First, check if this note is part of a tie relationship
    if (note.tie && note.tie.notes) {
      // Get all the notes in this tie relationship
      const tieNotes = note.tie.notes

      // If there are multiple notes in the tie
      if (tieNotes.length > 1) {
        console.warn(`Note is part of a tie with ${tieNotes.length} notes`)

        // Find this note's position in the tie relationship
        const noteIndex = tieNotes.indexOf(note)

        // If this note is not the first note in the tie, it's a continuation
        // note and should not be played
        if (noteIndex > 0) {
          console.warn(`Note is position ${noteIndex} in tie - should not be played`)
          return true
        }

        // Even if it's the first note in tie.notes, check if it has a continuing
        // tie from previous measure or voice by examining the tie's Type property
        if (note.tie.Type === 'stop' || note.tie.Type === 'continue') {
          console.warn(`Note has tie Type=${note.tie.Type}`)
          return true
        }
      }
    }

    // Look for note.Notations?.TiedList with a 'stop' type
    if (note.Notations && note.Notations.TiedList) {
      for (const tied of note.Notations.TiedList) {
        if (tied.Type === 'stop') {
          console.warn('Found tied stop in TiedList')
          return true
        }
      }
    }

    // Check for tie start vs continue/stop
    if (note.tie && note.tie.Type) {
      if (note.tie.Type !== 'start' && note.tie.Type !== '') {
        console.warn(`Note has non-start tie Type: ${note.tie.Type}`)
        return true
      }
    }

    return false
  } catch (err) {
    console.warn('Error checking if note is tied:', err)
    return false
  }
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

      // Add more detailed debugging for the first note
      if (notesUnderCursor[0]) {
        console.warn('Note properties:', Object.keys(notesUnderCursor[0]))

        // Look for any property containing "tie" in its name
        const tieProperties = Object.keys(notesUnderCursor[0]).filter(key =>
          key.toLowerCase().includes('tie'),
        )
        if (tieProperties.length > 0) {
          console.warn('Properties related to ties:', tieProperties)
        }
      }
    }

    // After checking properties related to ties, add this section for detailed analysis
    if (notesUnderCursor[0] && notesUnderCursor[0].tie) {
      console.warn('Detailed tie information:')
      try {
        // Check the tie notes array to identify which notes come first/second
        const tieNotes = notesUnderCursor[0].tie.notes
        if (tieNotes && tieNotes.length > 0) {
          console.warn(`  Tie contains ${tieNotes.length} notes`)

          // Compare notes by reference to see if the current note is in the tie
          const currentNoteIndex = tieNotes.indexOf(notesUnderCursor[0])
          console.warn(`  Current note index in tie: ${currentNoteIndex}`)
        }

        // Log some more specific information about the tie
        if (typeof notesUnderCursor[0].tie.Type === 'string') {
          console.warn(`  Tie Type: ${notesUnderCursor[0].tie.Type}`)
        }
      } catch (tieErr) {
        console.warn('Error analyzing tie object:', tieErr)
      }
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

          // Check if this is a tied note using our helper
          let isTied = isTiedNote(note)

          // ADDITIONAL CHECK: Examine the note's neighboring notes for tie relationships
          if (!isTied && note.tie && note.tie.notes && note.tie.notes.length > 1) {
            // Get this note's position in the tie.notes array
            const indexInTie = note.tie.notes.indexOf(note)

            // If this is not the first note in the tie, it's definitely tied
            if (indexInTie > 0) {
              console.warn(`Note ${noteName} is tied (position ${indexInTie} in tie.notes array)`)
              isTied = true
            }
            // If this is the first note, check if it's continuing a tie from a previous measure
            else if (indexInTie === 0 && note.tie.Type && note.tie.Type !== 'start') {
              console.warn(
                `First note in a tie but has Type=${note.tie.Type}, may be continuing from previous measure`,
              )
              isTied = true
            }
          }

          // If note has TieList with a 'stop' type, it's definitely tied
          if (!isTied && note.TieList && note.TieList.length > 0) {
            for (const tie of note.TieList) {
              if (tie.Type === 'stop' || tie.Type === 'continue') {
                console.warn(`Note ${noteName} has TieList with Type=${tie.Type}`)
                isTied = true
                break
              }
            }
          }

          if (isTied) {
            console.warn(`Note ${noteName} is a tied note - will be handled differently`)
          }

          return {
            name: noteName,
            duration: duration,
            midiNote: pitchObj.halfTone,
            isTied: isTied,
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

  const handleNextNote = useCallback(() => {
    if (!osmdRef.current?.cursor || !isLoaded) return

    try {
      // Move to the next position
      osmdRef.current.cursor.next()
      const notesUnderCursor = osmdRef.current.cursor.NotesUnderCursor()

      if (notesUnderCursor?.length > 0) {
        const notes = extractNotesInfo(notesUnderCursor)

        if (notes.length > 0) {
          // Check if ALL notes at this position are tied
          const allTied = notes.every(note => note.isTied)

          if (allTied) {
            console.warn('ALL notes at this position are tied - auto-advancing')

            // If all notes are tied, auto-advance to the next position
            setTimeout(() => {
              handleNextNote()
            }, 10)
          } else {
            // At least one note needs to be played, proceed normally
            if (onNoteSelected) {
              onNoteSelected(notes, { autoPlay: autoPlayEnabled })
            }
          }
        }
      }
    } catch (err) {
      console.error('Error navigating to next note:', err)
    }
  }, [onNoteSelected, autoPlayEnabled, isLoaded])

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
  }, [onNoteSelected, autoPlayEnabled, isLoaded])

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
  }, [onNoteSelected, autoPlayEnabled, isLoaded])

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
