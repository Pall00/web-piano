// src/components/FooterPiano/utils/pianoUtils.js
/**
 * Generates data for all 88 piano keys (A0 to C8)
 * @returns {Array} Array of key objects with note and isBlack properties
 */
export const generatePianoKeys = () => {
  const keys = []

  // Piano starts at A0
  const endOctave = 8

  // All notes in order
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

  // Add A0 to B0
  keys.push({ note: 'A0', isBlack: false })
  keys.push({ note: 'A#0', isBlack: true })
  keys.push({ note: 'B0', isBlack: false })

  // Add remaining octaves C1 to C8
  for (let octave = 1; octave <= endOctave; octave++) {
    notes.forEach(note => {
      // Only go up to C8
      if (octave === endOctave && note !== 'C') return

      keys.push({
        note: `${note}${octave}`,
        isBlack: note.includes('#'),
      })
    })
  }

  return keys
}

/**
 * Calculates black key position based on adjacent white keys
 * @param {string} note - Note name (e.g. "C#4")
 * @param {Array} whiteKeys - Array of white key objects
 * @param {number} whiteKeyWidth - Width of a white key in pixels
 * @returns {number} Position of the black key in pixels
 */
export const calculateBlackKeyPosition = (note, whiteKeys, whiteKeyWidth) => {
  // Extract note and octave (e.g. "C#4" -> "C#" and "4")
  const noteName = note.slice(0, -1)
  const octave = note.slice(-1)

  // The black key positions relative to white keys
  // Values closer to 1.0 will position the black keys further to the right
  // Using slightly different values for each black key to create a more realistic layout
  const blackKeyMap = {
    'C#': 0.92, // C# positioned 78% of the way from C to D
    'D#': 0.92, // D# positioned 82% of the way from D to E
    'F#': 0.92, // F# positioned 78% of the way from F to G
    'G#': 0.92, // G# positioned 82% of the way from G to A
    'A#': 0.92, // A# positioned 78% of the way from A to B
  }

  // Find the previous white key index
  const prevWhiteKey =
    noteName === 'C#'
      ? `C${octave}`
      : noteName === 'D#'
        ? `D${octave}`
        : noteName === 'F#'
          ? `F${octave}`
          : noteName === 'G#'
            ? `G${octave}`
            : `A${octave}`

  // Find index of the previous white key
  const prevKeyIndex = whiteKeys.findIndex(k => k.note === prevWhiteKey)

  if (prevKeyIndex === -1) return 0

  // Calculate position
  return prevKeyIndex * whiteKeyWidth + whiteKeyWidth * blackKeyMap[noteName]
}
