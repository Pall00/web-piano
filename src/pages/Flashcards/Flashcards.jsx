import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// TÄSSÄ OLI VIRHE: Lisätään aaltosulkeet { } ympärille
import { useFlashcards } from '../../hooks/useFlashcards'
import Flashcard from '../../components/Flashcard'
import FlashcardControls from '../../components/FlashcardControls'
import CategorySelector from '../../components/CategorySelector'
import { PageContainer, ContentArea } from './Flashcards.styles'

const Flashcards = () => {
  const {
    flashcardSets,
    activeSetId,
    currentCard,
    currentCardIndex,
    selectCardSet,
    nextCard,
    prevCard,
  } = useFlashcards()

  // TILA KÄÄNTÄMISELLE
  const [isFlipped, setIsFlipped] = useState(false)

  // Kun kortti vaihtuu, käännä kortti aina etupuolelle
  useEffect(() => {
    setIsFlipped(false)
  }, [currentCardIndex, activeSetId])

  const handleSetSelect = setId => {
    selectCardSet(setId)
    setIsFlipped(false)
  }

  const handleCardFlip = () => {
    setIsFlipped(prev => !prev)
  }

  return (
    <PageContainer>
      <CategorySelector
        categories={flashcardSets}
        activeCategory={activeSetId}
        onSelectCategory={handleSetSelect}
      />

      <ContentArea>
        <AnimatePresence mode="wait">
          {currentCard ? (
            <motion.div
              key={currentCard.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
            >
              <Flashcard card={currentCard} isFlipped={isFlipped} onFlip={handleCardFlip} />
            </motion.div>
          ) : (
            <div className="no-cards">Valitse kategoria aloittaaksesi</div>
          )}
        </AnimatePresence>

        <FlashcardControls
          onNext={nextCard}
          onPrev={prevCard}
          currentIndex={currentCardIndex}
          totalCards={flashcardSets.find(s => s.id === activeSetId)?.cards.length || 0}
        />
      </ContentArea>
    </PageContainer>
  )
}

export default Flashcards
