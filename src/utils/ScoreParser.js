// src/utils/ScoreParser.js
import logger from './logger'
import { midiToNote } from './musicTheory'

/**
 * ScoreParser
 *
 * Muuttaa OSMD:n monimutkaisen nuottidatan lineaariseksi tapahtumalistaksi.
 * - Yhdistää sidotut nuotit (ties) yhdeksi pitkäksi nuotiksi.
 * - Käyttää tarkkaa musiikillista ajoitusta (timestamps).
 * - Suodattaa pois sidosten "hännät" (silent tail notes).
 */
export const parseScore = osmd => {
  if (!osmd || !osmd.cursor) {
    logger.warn('ScoreParser: OSMD instance or cursor not found')
    return []
  }

  logger.info('ScoreParser: Starting score analysis...')
  const startTime = performance.now()

  // 1. Alustetaan iteraattori
  osmd.cursor.reset()
  const iterator = osmd.cursor.Iterator

  if (!iterator) {
    logger.error('ScoreParser: Iterator could not be initialized')
    return []
  }

  const scoreEvents = []

  // 2. Käydään kappale läpi alusta loppuun
  while (!iterator.EndReached) {
    const currentTimestamp = iterator.CurrentSourceTimestamp.RealValue
    const voiceEntries = iterator.CurrentVoiceEntries

    const activeNotes = []

    // Käydään läpi kaikki äänet tässä ajanhetkessä
    for (const voiceEntry of voiceEntries) {
      if (!voiceEntry.Notes) continue

      for (const note of voiceEntry.Notes) {
        // Ohitetaan tauot ja nuotit ilman sävelkorkeutta
        if (note.isRest() || !note.Pitch) continue

        // --- SIDOSTEN (TIES) KÄSITTELY ---

        // Jos nuotti on osa sidosta, mutta EI sen alku (eli se on "häntä"),
        // ohitamme sen kokonaan. Se on käsitelty jo aiemmin "pään" kohdalla.
        if (note.tie && note.tie.StartNote !== note) {
          continue
        }

        // Lasketaan nuotin kesto
        let duration = note.Length.RealValue

        // Jos tämä on sidoksen alku (pää), lasketaan koko ketjun yhteiskesto
        if (note.tie) {
          try {
            const totalDuration = note.tie.Notes.reduce((sum, tiedNote) => {
              return sum + tiedNote.Length.RealValue
            }, 0)
            duration = totalDuration
          } catch (err) {
            logger.warn('ScoreParser: Error calculating tied duration', err)
          }
        }

        // --- DATAN KERÄYS ---

        const midiNote = note.Pitch.halfTone
        const noteName = midiToNote(midiNote)

        activeNotes.push({
          note: noteName,
          midi: midiNote,
          duration: duration,
          timestamp: currentTimestamp,
          // Nimetään uudelleen selkeyden vuoksi: tämä on sidoksen ALKU.
          // Koska suodatamme hännät pois (rivi 48), kaikki listalle päätyvät
          // sidotut nuotit ovat "päitä", jotka pitää soittaa.
          isTieStart: !!note.tie,
        })
      }
    }

    // Jos tässä hetkessä oli nuotteja, lisätään tapahtuma listaan
    if (activeNotes.length > 0) {
      scoreEvents.push({
        timestamp: currentTimestamp,
        notes: activeNotes,
      })
    }

    iterator.moveToNext()
  }

  // Palautetaan kursori alkuun
  osmd.cursor.reset()

  const endTime = performance.now()
  logger.info(
    `ScoreParser: Analysis complete in ${(endTime - startTime).toFixed(2)}ms. Found ${scoreEvents.length} events.`,
  )

  return scoreEvents
}
