// src/components/NotationDisplay/NotationDisplay.jsx
import { useRef, useEffect } from 'react'
import Vex from 'vexflow'
import { NotationContainer } from './NotationDisplay.styles'

const NotationDisplay = ({ note, clef = 'treble', width = 200, height = 150 }) => {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Clear previous rendering
    containerRef.current.innerHTML = ''

    try {
      // Create VexFlow renderer
      const VF = Vex.Flow
      const renderer = new VF.Renderer(containerRef.current, VF.Renderer.Backends.SVG)

      // Configure renderer
      renderer.resize(width, height)
      const context = renderer.getContext()
      context.setFont('Arial', 10)

      // Create stave
      const stave = new VF.Stave(10, 40, width - 20)
      stave.addClef(clef)
      stave.setContext(context).draw()

      // Parse the note
      const [noteName, octave] = parseNote(note)

      // Create the note
      const notes = [
        new VF.StaveNote({
          clef: clef,
          keys: [`${noteName}/${octave}`],
          duration: 'q',
        }),
      ]

      // Add accidental if needed
      if (noteName.includes('#')) {
        notes[0].addAccidental(0, new VF.Accidental('#'))
      } else if (noteName.includes('b')) {
        notes[0].addAccidental(0, new VF.Accidental('b'))
      }

      // Create a voice and add notes
      const voice = new VF.Voice({ num_beats: 1, beat_value: 4 })
      voice.addTickables(notes)

      // Format and draw
      new VF.Formatter().joinVoices([voice]).format([voice], width - 50)
      voice.draw(context, stave)
    } catch (error) {
      console.error('Error rendering notation:', error)
    }
  }, [note, clef, width, height])

  // Helper function to parse note string (e.g., "C4" -> ["C", 4])
  const parseNote = noteStr => {
    const match = noteStr.match(/^([A-Ga-g][#b]?)(\d)$/)
    if (!match) {
      console.error(`Invalid note format: ${noteStr}`)
      return ['C', 4] // Default to middle C if format is invalid
    }
    return [match[1], match[2]]
  }

  return <NotationContainer ref={containerRef} />
}

export default NotationDisplay
