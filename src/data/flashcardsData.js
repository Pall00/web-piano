// src/data/flashcardsData.js

/**
 * Initial flashcard sets with basic data structure
 * In future phases, this can be expanded with more complex question/answer types
 */
export const initialFlashcardSets = [
  {
    id: 'basic-notes',
    name: 'Basic Notes',
    description: 'Learn to identify basic musical notes',
    difficulty: 'beginner',
    cards: [
      {
        id: 'note-1',
        question: 'What note is this: C?',
        answer: 'C is the white key to the left of two black keys',
      },
      {
        id: 'note-2',
        question: 'What note is this: D?',
        answer: 'D is the white key between two groups of black keys',
      },
      {
        id: 'note-3',
        question: 'What note is this: E?',
        answer: 'E is the white key to the right of two black keys',
      },
      {
        id: 'note-4',
        question: 'What note is this: F?',
        answer: 'F is the white key to the left of three black keys',
      },
      {
        id: 'note-5',
        question: 'What note is this: G?',
        answer: 'G is the white key between the first and second of three black keys',
      },
    ],
  },
  {
    id: 'basic-intervals',
    name: 'Basic Intervals',
    description: 'Learn to identify basic musical intervals',
    difficulty: 'beginner',
    cards: [
      {
        id: 'interval-1',
        question: 'What interval is C to D?',
        answer: 'Major 2nd (whole step)',
      },
      {
        id: 'interval-2',
        question: 'What interval is C to E?',
        answer: 'Major 3rd',
      },
      {
        id: 'interval-3',
        question: 'What interval is C to F?',
        answer: 'Perfect 4th',
      },
      {
        id: 'interval-4',
        question: 'What interval is C to G?',
        answer: 'Perfect 5th',
      },
      {
        id: 'interval-5',
        question: 'What interval is C to A?',
        answer: 'Major 6th',
      },
    ],
  },
  {
    id: 'basic-chords',
    name: 'Basic Chords',
    description: 'Learn to identify and play basic piano chords',
    difficulty: 'intermediate',
    cards: [
      {
        id: 'chord-1',
        question: 'What notes make up a C Major chord?',
        answer: 'C, E, G',
      },
      {
        id: 'chord-2',
        question: 'What notes make up a G Major chord?',
        answer: 'G, B, D',
      },
      {
        id: 'chord-3',
        question: 'What notes make up a D Minor chord?',
        answer: 'D, F, A',
      },
      {
        id: 'chord-4',
        question: 'What notes make up an F Major chord?',
        answer: 'F, A, C',
      },
      {
        id: 'chord-5',
        question: 'What notes make up an A Minor chord?',
        answer: 'A, C, E',
      },
    ],
  },
  {
    id: 'note-reading',
    name: 'Note Reading',
    description: 'Practice reading notes on the staff',
    difficulty: 'beginner',
    cards: [
      {
        id: 'staff-note-1',
        type: 'notation',
        question: 'What note is this?',
        notation: 'C4',
        answer: 'C4 (Middle C)',
      },
      {
        id: 'staff-note-2',
        type: 'notation',
        question: 'What note is this?',
        notation: 'E4',
        answer: 'E4',
      },
      {
        id: 'staff-note-3',
        type: 'notation',
        question: 'What note is this?',
        notation: 'G4',
        answer: 'G4',
      },
      {
        id: 'staff-note-4',
        type: 'notation',
        question: 'What note is this?',
        notation: 'B4',
        answer: 'B4',
      },
      {
        id: 'staff-note-5',
        type: 'notation',
        question: 'What note is this?',
        notation: 'F#4',
        answer: 'F#4 (F sharp 4)',
      },
    ],
  },
  {
    id: 'chord-reading',
    name: 'Chord Reading',
    description: 'Practice reading basic chords on the staff',
    difficulty: 'intermediate',
    cards: [
      {
        id: 'chord-notation-1',
        type: 'notation',
        question: 'What chord is this?',
        notation: ['C4', 'E4', 'G4'],
        answer: 'C Major',
      },
      {
        id: 'chord-notation-2',
        type: 'notation',
        question: 'What chord is this?',
        notation: ['G4', 'B4', 'D5'],
        answer: 'G Major',
      },
      {
        id: 'chord-notation-3',
        type: 'notation',
        question: 'What chord is this?',
        notation: ['D4', 'F4', 'A4'],
        answer: 'D Minor',
      },
      {
        id: 'chord-notation-4',
        type: 'notation',
        question: 'What chord is this?',
        notation: ['A4', 'C5', 'E5'],
        answer: 'A Minor',
      },
      {
        id: 'chord-notation-5',
        type: 'notation',
        question: 'What chord is this?',
        notation: ['F4', 'A4', 'C5'],
        answer: 'F Major',
      },
    ],
  },
]
