import { InfoPanel, NoteList, NoteItem, MatchStatus } from '../Notation.styles'

const NoteInfoPanel = ({ currentNotes, activeNotes, matchedNotes, isMatched }) => {
  if (!currentNotes || currentNotes.length === 0) return null

  return (
    <InfoPanel initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <h3>
        Target Notes
        {isMatched && (
          <MatchStatus
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            ✓ Correct!
          </MatchStatus>
        )}
      </h3>
      <NoteList>
        {currentNotes.map((note, index) => {
          // Määritellään tila tyylittelyä varten
          const isCorrect = matchedNotes.includes(note.name)
          const isPressed = activeNotes.includes(note.name)

          return (
            <NoteItem
              key={`${note.name}-${index}`}
              $isCorrect={isCorrect}
              $isPressed={isPressed}
              $isTied={note.isTied}
            >
              <span className="note-name">{note.name}</span>
              <span className="note-details">
                {note.midiNote && `MIDI: ${note.midiNote}`}
                {note.isTied && ' (tied)'}
              </span>
            </NoteItem>
          )
        })}
      </NoteList>
    </InfoPanel>
  )
}

export default NoteInfoPanel
