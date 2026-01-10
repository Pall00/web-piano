// src/components/Flashcard/FlashcardNotation.jsx
import { useEffect, useRef } from 'react'
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay'
import styled from 'styled-components'

const NotationContainer = styled.div`
  width: 100%;
  height: 180px;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none; /* Tärkeä: päästää klikkaukset läpi kortille */
  overflow: hidden;

  /* Pakotetaan OSMD:n luoma SVG keskelle ja oikean kokoiseksi */
  & > div {
    width: 100% !important; /* Pakota kontti täyteen leveyteen */
    display: flex;
    justify-content: center;
  }

  svg {
    width: auto !important;
    max-width: 90%;
    height: auto !important;
    max-height: 100%;
    margin: 0 auto; /* Keskitys */
  }
`

const FlashcardNotation = ({ xmlData }) => {
  const containerRef = useRef(null)
  const osmdRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || !xmlData) return

    let isMounted = true // Lippu: onko komponentti yhä olemassa?
    const container = containerRef.current

    // Tyhjennetään kontti heti aluksi
    while (container.firstChild) {
      container.removeChild(container.firstChild)
    }

    const loadScore = async () => {
      try {
        const osmd = new OpenSheetMusicDisplay(container, {
          autoResize: false,
          backend: 'svg',
          drawingParameters: 'compacttight', // Tiiviimpi piirto
          drawTitle: false,
          drawSubtitle: false,
          drawComposer: false,
          drawLyricist: false,
          drawCredits: false,
          drawPartNames: false,
          drawMetronomeMarks: false,
          drawTimeSignatures: false,
          drawMeasureNumbers: false,
          renderSingleHorizontalStaffline: true,
          // Lisää marginaaleja jos nuotti jää reunaan
          paddingRight: 10,
          paddingLeft: 10,
        })

        if (!isMounted) return

        osmdRef.current = osmd
        osmd.setLogLevel('warn')

        await osmd.load(xmlData)

        // Varmistetaan vielä latauksen jälkeen, että komponentti on olemassa
        if (isMounted) {
          osmd.Zoom = 1.5
          osmd.render()
        }
      } catch (error) {
        console.error('Error rendering flashcard notation:', error)
      }
    }

    loadScore()

    // Cleanup-funktio: merkitään että komponentti on poistunut
    return () => {
      isMounted = false
      osmdRef.current = null
      // Varmuuden vuoksi tyhjennetään kontti, jos React poistaa komponentin
      if (container) {
        while (container.firstChild) {
          container.removeChild(container.firstChild)
        }
      }
    }
  }, [xmlData])

  return <NotationContainer ref={containerRef} />
}

export default FlashcardNotation
