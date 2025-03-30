// src/components/Flashcard/Flashcard.styles.js
import styled from 'styled-components'

export const FlashcardContainer = styled.div`
  width: 100%;
  height: 300px;
  perspective: 1000px;
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing(6)};

  .card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 0.4s ease-out;
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
  box-shadow: ${({ theme }) =>
    theme.isDarkMode ? '0 10px 20px rgba(0, 0, 0, 0.4)' : theme.shadows.medium};
  backface-visibility: hidden;
  overflow: hidden;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: ${({ theme }) =>
      theme.isDarkMode ? '0 14px 28px rgba(0, 0, 0, 0.5)' : '0 10px 20px rgba(0, 0, 0, 0.15)'};
  }
`

export const QuestionSide = styled(CardFace)`
  background-color: ${({ theme }) =>
    theme.isDarkMode ? theme.colors.background.card : theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.primary};
`

export const AnswerSide = styled(CardFace)`
  background-color: ${({ theme }) =>
    theme.isDarkMode
      ? 'rgba(93, 142, 217, 0.3)' // More opaque blue background in dark mode
      : theme.colors.primary.hover};
  border: 1px solid ${({ theme }) => theme.colors.primary.main};
  transform: rotateY(180deg);
`

export const CardTitle = styled.h3`
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  font-size: 2rem;
  color: ${({ theme }) => (theme.isDarkMode ? '#FFFFFF' : theme.colors.text.primary)};
  font-weight: 600;
`

export const CardContent = styled.p`
  font-size: 2.5rem;
  font-weight: 500;
  text-align: center;
  color: ${({ theme }) => (theme.isDarkMode ? '#FFFFFF' : theme.colors.text.primary)};
`
