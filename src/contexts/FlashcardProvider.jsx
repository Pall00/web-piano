import { useState, useEffect } from 'react'
import { FlashcardContext } from './flashcardContext'
// Tuodaan uudet datat (FLASHCARDS_DATA, FLASHCARD_CATEGORIES) vanhan sijaan
import { FLASHCARDS_DATA, FLASHCARD_CATEGORIES } from '../data/flashcardsData'

export const FlashcardProvider = ({ children }) => {
  const [flashcardSets, setFlashcardSets] = useState([])
  const [activeSetId, setActiveSetId] = useState(null)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)

  // Load flashcard sets from data file
  useEffect(() => {
    // Muunnetaan uusi data-rakenne vanhan sovelluslogiikan ymmärtämäksi "sets"-muodoksi
    const generatedSets = Object.entries(FLASHCARD_CATEGORIES).map(([key, label]) => {
      return {
        id: key,
        name: label,
        description: `Harjoittele: ${label}`,
        // Suodatetaan tähän kategoriaan kuuluvat kortit
        cards: FLASHCARDS_DATA.filter(card => card.category === key),
      }
    })

    setFlashcardSets(generatedSets)

    // Asetetaan ensimmäinen pakka aktiiviseksi oletuksena
    if (generatedSets.length > 0) {
      setActiveSetId(generatedSets[0].id)
    }
  }, [])

  // Get the active card set
  const activeSet = flashcardSets.find(set => set.id === activeSetId) || null

  // Get current card from the active set
  const currentCard = activeSet && activeSet.cards[currentCardIndex]

  // Function to select a card set
  const selectCardSet = setId => {
    setActiveSetId(setId)
    setCurrentCardIndex(0) // Reset to first card when changing sets
  }

  // Go to next card
  const nextCard = () => {
    if (!activeSet) return

    // If we're at the last card, loop back to the first
    if (currentCardIndex >= activeSet.cards.length - 1) {
      setCurrentCardIndex(0)
    } else {
      setCurrentCardIndex(currentCardIndex + 1)
    }
  }

  // Go to previous card
  const prevCard = () => {
    if (!activeSet) return

    // If we're at the first card, go to the last
    if (currentCardIndex <= 0) {
      setCurrentCardIndex(activeSet.cards.length - 1)
    } else {
      setCurrentCardIndex(currentCardIndex - 1)
    }
  }

  return (
    <FlashcardContext.Provider
      value={{
        flashcardSets,
        activeSetId,
        currentCard,
        currentCardIndex,
        selectCardSet,
        nextCard,
        prevCard,
      }}
    >
      {children}
    </FlashcardContext.Provider>
  )
}

export default FlashcardProvider
