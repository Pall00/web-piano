// src/utils/ScoreParser.js
import logger from './logger'
import { midiToNote } from './musicTheory'

/**
 * ScoreParser
 * Parses OSMD data.
 * Uses Global Staff Index to separate hands reliably.
 */
export const parseScore = osmd => {
  if (!osmd || !osmd.cursor) {
    logger.warn('ScoreParser: OSMD instance or cursor not found')
    return []
  }

  logger.info('ScoreParser: Starting global index analysis...')
  const startTime = performance.now()

  // Map Staff Objects to a 1-based global index
  const staffIdMap = new Map()
  if (osmd.Sheet && osmd.Sheet.Staves) {
    osmd.Sheet.Staves.forEach((staff, index) => {
      staffIdMap.set(staff, index + 1)
    })
  }

  osmd.cursor.reset()
  const iterator = osmd.cursor.Iterator

  if (!iterator) return []

  const scoreEvents = []
  let staff1Count = 0
  let staff2Count = 0

  while (!iterator.EndReached) {
    const currentTimestamp = iterator.CurrentSourceTimestamp.RealValue
    const voiceEntries = iterator.CurrentVoiceEntries
    const activeNotes = []

    for (const voiceEntry of voiceEntries) {
      if (!voiceEntry.Notes) continue

      let staffId = 1
      let staffObj = null

      // Determine Staff Object from VoiceEntry or Note
      if (voiceEntry.ParentSourceStaffEntry && voiceEntry.ParentSourceStaffEntry.ParentStaff) {
        staffObj = voiceEntry.ParentSourceStaffEntry.ParentStaff
      } else if (voiceEntry.ParentStaffEntry && voiceEntry.ParentStaffEntry.ParentStaff) {
        staffObj = voiceEntry.ParentStaffEntry.ParentStaff
      } else if (
        voiceEntry.Notes[0] &&
        voiceEntry.Notes[0].SourceStaffEntry &&
        voiceEntry.Notes[0].SourceStaffEntry.ParentStaff
      ) {
        staffObj = voiceEntry.Notes[0].SourceStaffEntry.ParentStaff
      }

      if (staffObj && staffIdMap.has(staffObj)) {
        staffId = staffIdMap.get(staffObj)
      }

      if (staffId === 1) staff1Count++
      if (staffId > 1) staff2Count++

      for (const note of voiceEntry.Notes) {
        if (note.isRest() || !note.Pitch) continue
        if (note.tie && note.tie.StartNote !== note) continue

        let duration = note.Length.RealValue * 4
        if (note.tie) {
          try {
            const totalDuration = note.tie.Notes.reduce(
              (sum, tiedNote) => sum + tiedNote.Length.RealValue,
              0,
            )
            duration = totalDuration * 4
          } catch (err) {
            logger.warn('ScoreParser: Error calculating tied duration', err)
          }
        }

        const midiNote = note.Pitch.halfTone
        const noteName = midiToNote(midiNote)

        activeNotes.push({
          note: noteName,
          midi: midiNote,
          duration: duration,
          timestamp: currentTimestamp,
          isTieStart: !!note.tie,
          staffId: staffId,
        })
      }
    }

    if (activeNotes.length > 0) {
      scoreEvents.push({
        timestamp: currentTimestamp,
        notes: activeNotes,
      })
    }

    iterator.moveToNext()
  }

  osmd.cursor.reset()

  const endTime = performance.now()
  logger.info(
    `ScoreParser: Analysis done in ${(endTime - startTime).toFixed(2)}ms. Staff 1: ${staff1Count}, Staff 2+: ${staff2Count}`,
  )

  return scoreEvents
}
