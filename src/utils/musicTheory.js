// src/utils/musicTheory.js

/**
 * Music Theory Utilities
 *
 * Single source of truth for all note conversions and music theory operations.
 * Handles MIDI, frequencies, note names, and various notation formats.
 */

import logger from './logger'

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Standard note names (chromatic scale with sharps)
 */
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

/**
 * Mapping of flat notes to their sharp equivalents
 */
const FLAT_TO_SHARP = {
  Cb: 'B',
  Db: 'C#',
  Eb: 'D#',
  Fb: 'E',
  Gb: 'F#',
  Ab: 'G#',
  Bb: 'A#',
}

/**
 * Piano range in MIDI numbers
 * Standard 88-key piano: A0 (21) to C8 (108)
 */
const PIANO_RANGE = {
  MIN_MIDI: 21, // A0
  MAX_MIDI: 108, // C8
}

/**
 * Reference frequency for A4
 */
const A4_FREQUENCY = 440.0

/**
 * MIDI note number for A4
 */
const A4_MIDI = 69

// ============================================================================
// CORE CONVERSION FUNCTIONS
// ============================================================================

/**
 * Convert MIDI note number to note name
 *
 * @param {number} midiNote - MIDI note number (0-127)
 * @returns {string|null} Note name (e.g., "C4", "F#5") or null if invalid
 *
 * @example
 * midiToNote(60)  // "C4" (Middle C)
 * midiToNote(69)  // "A4" (440 Hz)
 * midiToNote(21)  // "A0" (Lowest piano key)
 * midiToNote(108) // "C8" (Highest piano key)
 */
export const midiToNote = midiNote => {
  if (midiNote === undefined || midiNote === null || typeof midiNote !== 'number') {
    logger.warn(`Invalid MIDI note number: ${midiNote}`)
    return null
  }

  // Calculate octave and note index
  // MIDI 60 = C4 (Middle C)
  const octave = Math.floor(midiNote / 12) - 1
  const noteIndex = midiNote % 12
  const noteName = NOTE_NAMES[noteIndex]

  // Handle special cases for very low notes (A0, A#0, B0)
  if (midiNote < 24) {
    // MIDI 21 = A0, 22 = A#0, 23 = B0
    return `${noteName}0`
  }

  return `${noteName}${octave}`
}

/**
 * Convert frequency (Hz) to note name
 *
 * @param {number} frequency - Frequency in Hz
 * @returns {string|null} Note name or null if invalid
 *
 * @example
 * frequencyToNote(440)    // "A4"
 * frequencyToNote(261.63) // "C4" (Middle C)
 * frequencyToNote(27.5)   // "A0" (Lowest piano key)
 */
export const frequencyToNote = frequency => {
  if (!frequency || frequency <= 0) {
    logger.warn(`Invalid frequency: ${frequency}`)
    return null
  }

  try {
    // Calculate semitone offset from A4 (440 Hz)
    // Formula: 12 * log2(f / 440)
    const semitoneOffset = 12 * Math.log2(frequency / A4_FREQUENCY)

    // Round to nearest semitone
    const semitones = Math.round(semitoneOffset)

    // Calculate MIDI note number (A4 is MIDI note 69)
    const midiNote = A4_MIDI + semitones

    return midiToNote(midiNote)
  } catch (err) {
    logger.error(`Error converting frequency ${frequency} to note:`, err)
    return null
  }
}

/**
 * Convert note name to MIDI number
 *
 * @param {string} note - Note name (e.g., "C4", "F#5")
 * @returns {number|null} MIDI note number or null if invalid
 *
 * @example
 * noteToMidi("C4")  // 60
 * noteToMidi("A4")  // 69
 * noteToMidi("A0")  // 21
 */
export const noteToMidi = note => {
  const normalized = normalizeNote(note)
  if (!normalized) return null

  const match = normalized.match(/^([A-G]#?)(\d+)$/)
  if (!match) return null

  const [, noteName, octaveStr] = match
  const octave = parseInt(octaveStr)

  // Find note index in chromatic scale
  const noteIndex = NOTE_NAMES.indexOf(noteName)
  if (noteIndex === -1) return null

  // Calculate MIDI number: (octave + 1) * 12 + noteIndex
  const midiNumber = (octave + 1) * 12 + noteIndex

  return midiNumber
}

// ============================================================================
// NOTE NORMALIZATION
// ============================================================================

/**
 * Normalize note name to standard format (sharps, uppercase)
 *
 * Handles:
 * - Flats → Sharps (Db → C#)
 * - Various sharp notations (s, ♯ → #)
 * - Various flat notations (b, ♭)
 * - Lowercase → Uppercase
 * - Octave adjustments for edge cases
 *
 * @param {string} note - Note name in any format
 * @returns {string|null} Normalized note name or null if invalid
 *
 * @example
 * normalizeNote("Db4")   // "C#4"
 * normalizeNote("cs4")   // "C#4"
 * normalizeNote("C♯4")   // "C#4"
 * normalizeNote("Bb3")   // "A#3"
 * normalizeNote("Cb4")   // "B3" (note octave change!)
 */
export const normalizeNote = note => {
  if (!note || typeof note !== 'string') {
    return null
  }

  try {
    // Trim whitespace
    let normalized = note.trim()

    // Match note pattern: letter + optional accidental + octave
    const match = normalized.match(/^([A-Ga-g])([#♯sb♭]?)(\d+)$/)
    if (!match) {
      logger.warn(`Invalid note format: ${note}`)
      return null
    }

    let [, noteLetter, accidental, octaveStr] = match
    let octave = parseInt(octaveStr)

    // Uppercase the note letter
    noteLetter = noteLetter.toUpperCase()

    // Normalize accidentals
    // Convert all sharp variants to '#'
    if (accidental === 's' || accidental === '♯') {
      accidental = '#'
    }
    // Convert all flat variants to 'b' for processing
    else if (accidental === '♭') {
      accidental = 'b'
    }

    // Handle flats - convert to sharp equivalents
    if (accidental === 'b') {
      const flatNoteName = noteLetter + 'b'
      const sharpEquivalent = FLAT_TO_SHARP[flatNoteName]

      if (sharpEquivalent) {
        // Special case: Cb and Fb need octave adjustment
        if (flatNoteName === 'Cb') {
          octave -= 1
        }

        // Use the sharp equivalent
        noteLetter = sharpEquivalent[0]
        accidental = sharpEquivalent[1] || ''
      } else {
        logger.warn(`Unknown flat note: ${flatNoteName}`)
        return null
      }
    }

    // Construct normalized note
    const normalizedNote = `${noteLetter}${accidental}${octave}`

    return normalizedNote
  } catch (err) {
    logger.error(`Error normalizing note ${note}:`, err)
    return null
  }
}

/**
 * Normalize note for Tone.js (always uses # for sharps)
 * Alias for normalizeNote since we always output # format
 *
 * @param {string} note - Note name
 * @returns {string|null} Note in Tone.js format
 */
export const normalizeNoteForTone = note => {
  return normalizeNote(note)
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Check if a note is within playable piano range (A0 to C8)
 *
 * @param {string} note - Note name
 * @returns {boolean} True if note is playable on 88-key piano
 *
 * @example
 * isPlayableNote("C4")   // true (Middle C)
 * isPlayableNote("A0")   // true (Lowest key)
 * isPlayableNote("C8")   // true (Highest key)
 * isPlayableNote("G0")   // false (below A0)
 * isPlayableNote("D8")   // false (above C8)
 */
export const isPlayableNote = note => {
  const normalized = normalizeNote(note)
  if (!normalized) return false

  const midiNumber = noteToMidi(normalized)
  if (midiNumber === null) return false

  return midiNumber >= PIANO_RANGE.MIN_MIDI && midiNumber <= PIANO_RANGE.MAX_MIDI
}

/**
 * Check if a note is in a valid range (not necessarily piano range)
 *
 * @param {string} note - Note name
 * @param {number} minMidi - Minimum MIDI number (default: 0)
 * @param {number} maxMidi - Maximum MIDI number (default: 127)
 * @returns {boolean} True if note is in range
 */
export const isNoteInRange = (note, minMidi = 0, maxMidi = 127) => {
  const midiNumber = noteToMidi(note)
  if (midiNumber === null) return false

  return midiNumber >= minMidi && midiNumber <= maxMidi
}

/**
 * Validate note format (doesn't check playability)
 *
 * @param {string} note - Note name to validate
 * @returns {boolean} True if note format is valid
 *
 * @example
 * isValidNoteFormat("C4")   // true
 * isValidNoteFormat("C#4")  // true
 * isValidNoteFormat("H4")   // false (H is not a valid note)
 * isValidNoteFormat("C")    // false (missing octave)
 */
export const isValidNoteFormat = note => {
  if (!note || typeof note !== 'string') return false

  const normalized = normalizeNote(note)
  return normalized !== null
}

// ============================================================================
// TRANSPOSITION FUNCTIONS
// ============================================================================

/**
 * Transpose a note by a number of semitones
 *
 * @param {string} note - Note to transpose
 * @param {number} semitones - Number of semitones (positive = up, negative = down)
 * @returns {string|null} Transposed note or null if invalid
 *
 * @example
 * transposeNote("C4", 12)   // "C5" (up one octave)
 * transposeNote("C4", -12)  // "C3" (down one octave)
 * transposeNote("C4", 1)    // "C#4" (up one semitone)
 * transposeNote("C#4", -1)  // "C4" (down one semitone)
 */
export const transposeNote = (note, semitones) => {
  const midiNumber = noteToMidi(note)
  if (midiNumber === null) return null

  const transposedMidi = midiNumber + semitones
  return midiToNote(transposedMidi)
}

/**
 * Transpose note to be within playable piano range
 *
 * @param {string} note - Note to transpose
 * @returns {string|null} Transposed note within piano range
 *
 * @example
 * transposeToPlayableRange("G0")  // "G1" (or higher if needed)
 * transposeToPlayableRange("D8")  // "D7" (or lower if needed)
 * transposeToPlayableRange("C4")  // "C4" (already in range)
 */
export const transposeToPlayableRange = note => {
  let midiNumber = noteToMidi(note)
  if (midiNumber === null) return null

  // Transpose up if too low
  while (midiNumber < PIANO_RANGE.MIN_MIDI) {
    midiNumber += 12 // Up one octave
  }

  // Transpose down if too high
  while (midiNumber > PIANO_RANGE.MAX_MIDI) {
    midiNumber -= 12 // Down one octave
  }

  return midiToNote(midiNumber)
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get the note name without octave
 *
 * @param {string} note - Full note name
 * @returns {string|null} Note name without octave or null if invalid
 *
 * @example
 * getNoteNameOnly("C4")   // "C"
 * getNoteNameOnly("F#5")  // "F#"
 * getNoteNameOnly("Bb3")  // "A#" (normalized)
 */
export const getNoteNameOnly = note => {
  const normalized = normalizeNote(note)
  if (!normalized) return null

  const match = normalized.match(/^([A-G]#?)(\d+)$/)
  return match ? match[1] : null
}

/**
 * Get the octave number from a note
 *
 * @param {string} note - Full note name
 * @returns {number|null} Octave number or null if invalid
 *
 * @example
 * getOctave("C4")   // 4
 * getOctave("F#5")  // 5
 * getOctave("A0")   // 0
 */
export const getOctave = note => {
  const normalized = normalizeNote(note)
  if (!normalized) return null

  const match = normalized.match(/^([A-G]#?)(\d+)$/)
  return match ? parseInt(match[2]) : null
}

/**
 * Get interval in semitones between two notes
 *
 * @param {string} note1 - First note
 * @param {string} note2 - Second note
 * @returns {number|null} Number of semitones (positive = note2 is higher)
 *
 * @example
 * getInterval("C4", "C5")   // 12 (one octave)
 * getInterval("C4", "E4")   // 4 (major third)
 * getInterval("E4", "C4")   // -4 (major third down)
 */
export const getInterval = (note1, note2) => {
  const midi1 = noteToMidi(note1)
  const midi2 = noteToMidi(note2)

  if (midi1 === null || midi2 === null) return null

  return midi2 - midi1
}

/**
 * Compare two notes (for sorting)
 *
 * @param {string} note1 - First note
 * @param {string} note2 - Second note
 * @returns {number} -1 if note1 < note2, 0 if equal, 1 if note1 > note2
 *
 * @example
 * ["E4", "C4", "G4"].sort(compareNotes) // ["C4", "E4", "G4"]
 */
export const compareNotes = (note1, note2) => {
  const midi1 = noteToMidi(note1)
  const midi2 = noteToMidi(note2)

  if (midi1 === null || midi2 === null) return 0

  return midi1 - midi2
}

// ============================================================================
// EXPORTS SUMMARY
// ============================================================================

export default {
  // Core conversions
  midiToNote,
  frequencyToNote,
  noteToMidi,

  // Normalization
  normalizeNote,
  normalizeNoteForTone,

  // Validation
  isPlayableNote,
  isNoteInRange,
  isValidNoteFormat,

  // Transposition
  transposeNote,
  transposeToPlayableRange,

  // Utilities
  getNoteNameOnly,
  getOctave,
  getInterval,
  compareNotes,

  // Constants (for reference)
  PIANO_RANGE,
  NOTE_NAMES,
}
