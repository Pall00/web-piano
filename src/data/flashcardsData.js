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
]
