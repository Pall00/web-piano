// src/components/Flashcard/Flashcard.styles.js
import styled from 'styled-components'

export const FlashcardContainer = styled.div`
  width: 100%;
  height: 300px;
  perspective: 1000px;
  cursor: pointer;

  .card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
  }
`

export const CardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(6)};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  backface-visibility: hidden;
  overflow: hidden;
`

export const QuestionSide = styled(CardFace)`
  background-color: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.border};
`

export const AnswerSide = styled(CardFace)`
  background-color: ${({ theme }) => theme.colors.primary.hover};
  border: 1px solid ${({ theme }) => theme.colors.primary.main};
  transform: rotateY(180deg);
`

export const CardTitle = styled.h3`
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.text.primary};
`

export const CardContent = styled.p`
  font-size: 2.5rem;
  font-weight: 500;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.primary};
`
