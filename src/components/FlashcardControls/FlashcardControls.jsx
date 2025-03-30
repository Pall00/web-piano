// src/components/FlashcardControls/FlashcardControls.jsx
import { motion } from 'framer-motion'
import {
  ControlsContainer,
  ControlsInner,
  NavButton,
  ProgressIndicator,
  ProgressText,
} from './FlashcardControls.styles'

const FlashcardControls = ({ onPrev, onNext, currentIndex, totalCards }) => {
  return (
    <ControlsContainer>
      <ControlsInner>
        <motion.div whileTap={{ scale: 0.95 }}>
          <NavButton onClick={onPrev} $direction="prev">
            ← Previous
          </NavButton>
        </motion.div>

        <ProgressIndicator>
          <ProgressText>
            {currentIndex + 1} of {totalCards}
          </ProgressText>
        </ProgressIndicator>

        <motion.div whileTap={{ scale: 0.95 }}>
          <NavButton onClick={onNext} $direction="next">
            Next →
          </NavButton>
        </motion.div>
      </ControlsInner>
    </ControlsContainer>
  )
}

export default FlashcardControls
