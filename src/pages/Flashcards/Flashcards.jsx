// src/pages/Flashcards/Flashcards.jsx
import { motion, AnimatePresence } from 'framer-motion'
import {
  FlashcardsContainer,
  PageTitle,
  FlashcardSection,
  NoCardsMessage,
} from './Flashcards.styles'
import { useFlashcards } from '../../hooks/useFlashcards'
import Flashcard from '../../components/Flashcard'
import CategorySelector from '../../components/CategorySelector'
import FlashcardControls from '../../components/FlashcardControls'

const Flashcards = () => {
  const {
    currentCard,
    nextCard,
    prevCard,
    flashcardSets,
    activeSetId,
    selectCardSet,
    currentCardIndex,
  } = useFlashcards()

  const activeSet = flashcardSets.find(set => set.id === activeSetId)
  const totalCards = activeSet?.cards?.length || 0

  return (
    <FlashcardsContainer>
      <PageTitle>Piano Flashcards</PageTitle>

      <CategorySelector
        categories={flashcardSets}
        activeCategory={activeSetId}
        onSelectCategory={selectCardSet}
      />

      <FlashcardSection>
        <AnimatePresence mode="wait">
          {currentCard ? (
            <motion.div
              key={currentCard.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Flashcard card={currentCard} />

              <FlashcardControls
                onPrev={prevCard}
                onNext={nextCard}
                currentIndex={currentCardIndex}
                totalCards={totalCards}
              />
            </motion.div>
          ) : (
            <NoCardsMessage>No flashcards available. Select a category to begin.</NoCardsMessage>
          )}
        </AnimatePresence>
      </FlashcardSection>
    </FlashcardsContainer>
  )
}

export default Flashcards
