// src/components/Flashcard/Flashcard.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FlashcardContainer,
  CardFace,
  QuestionSide,
  AnswerSide,
  CardTitle,
  CardContent,
} from './Flashcard.styles'
import NotationDisplay from '../NotationDisplay'

const Flashcard = ({ card }) => {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  // Simple animation variants
  const cardVariants = {
    front: {
      rotateY: 0,
      transition: { duration: 0.4 },
    },
    back: {
      rotateY: 180,
      transition: { duration: 0.4 },
    },
  }

  // Check if the card has notation data
  const hasNotation = card.type === 'notation' && card.notation

  return (
    <FlashcardContainer onClick={handleFlip}>
      <motion.div
        className="card-inner"
        initial="front"
        animate={isFlipped ? 'back' : 'front'}
        variants={cardVariants}
      >
        <QuestionSide as={CardFace}>
          <CardTitle>Question</CardTitle>
          <CardContent>
            {hasNotation ? (
              <>
                <p>{card.question}</p>
                <NotationDisplay note={card.notation} />
              </>
            ) : (
              card.question
            )}
          </CardContent>
        </QuestionSide>
        <AnswerSide as={CardFace}>
          <CardTitle>Answer</CardTitle>
          <CardContent>{card.answer}</CardContent>
        </AnswerSide>
      </motion.div>
    </FlashcardContainer>
  )
}

export default Flashcard
