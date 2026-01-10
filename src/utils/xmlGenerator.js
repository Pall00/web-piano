// src/utils/xmlGenerator.js

/**
 * Generoi MusicXML-merkkijonon yksittäiselle nuotille.
 * @param {string} noteName - Nuotin nimi (esim. "C4", "F#3")
 * @param {string} clef - Nuottiavain ("G" = diskantti, "F" = basso)
 * @returns {string|null} - MusicXML merkkijonona tai null jos virhe
 */
export const generateSingleNoteXML = (noteName, clef = 'G') => {
  if (!noteName) return null

  // Parsitaan nuotin nimi (Esim. "C4" tai "F#5")
  // Regex: Kirjain (A-G), mahdollinen etumerkki (#), ja numero (oktaavi)
  const noteMatch = noteName.match(/^([A-G][#]?)(\d)$/)
  if (!noteMatch) return null

  const stepWithAccidental = noteMatch[1] // "C" tai "F#"
  const step = stepWithAccidental.charAt(0) // Pelkkä nuotin nimi "C" tai "F"
  const octave = noteMatch[2] // Oktaavi "4"

  const hasSharp = stepWithAccidental.includes('#')
  const alter = hasSharp ? 1 : 0

  // Määritä clef (G = treble/diskantti, F = bass/basso)
  // G-avain on viivalla 2, F-avain viivalla 4
  const clefSign = clef === 'F' ? 'F' : 'G'
  const clefLine = clef === 'F' ? 4 : 2

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <part-list>
    <score-part id="P1">
      <part-name>Music</part-name>
    </score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key>
          <fifths>0</fifths>
        </key>
        <time>
          <beats>4</beats>
          <beat-type>4</beat-type>
        </time>
        <clef>
          <sign>${clefSign}</sign>
          <line>${clefLine}</line>
        </clef>
      </attributes>
      <note>
        <pitch>
          <step>${step}</step>
          <alter>${alter}</alter>
          <octave>${octave}</octave>
        </pitch>
        <duration>4</duration>
        <type>whole</type>
        ${hasSharp ? '<accidental>sharp</accidental>' : ''}
      </note>
    </measure>
  </part>
</score-partwise>`
}
