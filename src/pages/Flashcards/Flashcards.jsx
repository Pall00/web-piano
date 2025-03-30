// src/pages/Flashcards/Flashcards.jsx
import { useState } from 'react'
import { FlashcardsContainer, PageTitle, FlashcardWrapper } from './Flashcards.styles'
import { useFlashcards } from '../../hooks/useFlashcards'

const Flashcards = () => {
  const { currentCard, nextCard, flashcardSets } = useFlashcards()
  const [flipped, setFlipped] = useState(false)

  const handleCardClick = () => {
    setFlipped(!flipped)
  }

  const handleNextCard = () => {
    setFlipped(false)
    nextCard()
  }

  return (
    <FlashcardsContainer>
      <PageTitle>Piano Flashcards</PageTitle>

      {currentCard ? (
        <FlashcardWrapper>
          <div className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={handleCardClick}>
            <div className="flashcard-front">
              <h3>Question</h3>
              <p>{currentCard.question}</p>
            </div>
            <div className="flashcard-back">
              <h3>Answer</h3>
              <p>{currentCard.answer}</p>
            </div>
          </div>
          <button onClick={handleNextCard}>Next Card</button>
        </FlashcardWrapper>
      ) : (
        <p>No flashcards available. Select a category to begin.</p>
      )}

      <div className="set-selection">
        <h3>Available Sets</h3>
        <ul>
          {flashcardSets.map(set => (
            <li key={set.id}>{set.name}</li>
          ))}
        </ul>
      </div>
    </FlashcardsContainer>
  )
}

export default Flashcards
