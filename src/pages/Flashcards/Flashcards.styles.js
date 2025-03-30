// src/pages/Flashcards/Flashcards.styles.js
import styled from 'styled-components'

export const FlashcardsContainer = styled.div`
  padding-top: 10rem;
  padding-bottom: 2rem;
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`

export const PageTitle = styled.h1`
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
`

export const FlashcardWrapper = styled.div`
  width: 100%;
  max-width: 500px;
  margin: ${({ theme }) => theme.spacing(6)} 0;
  display: flex;
  flex-direction: column;
  align-items: center;

  .flashcard {
    width: 100%;
    height: 300px;
    position: relative;
    cursor: pointer;
    perspective: 1000px;
    transition: transform 0.6s;
    transform-style: preserve-3d;

    &.flipped {
      transform: rotateY(180deg);
    }

    .flashcard-front,
    .flashcard-back {
      position: absolute;
      width: 100%;
      height: 100%;
      padding: ${({ theme }) => theme.spacing(6)};
      backface-visibility: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: ${({ theme }) => theme.borderRadius.large};
      box-shadow: ${({ theme }) => theme.shadows.medium};
      background-color: ${({ theme }) => theme.colors.background.paper};
      border: 1px solid ${({ theme }) => theme.colors.border};
    }

    .flashcard-back {
      transform: rotateY(180deg);
      background-color: ${({ theme }) => theme.colors.primary.hover};
    }

    h3 {
      margin-bottom: ${({ theme }) => theme.spacing(4)};
      font-size: 2rem;
    }

    p {
      font-size: 2.5rem;
      font-weight: 500;
    }
  }

  button {
    margin-top: ${({ theme }) => theme.spacing(4)};
    padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(6)};
    background-color: ${({ theme }) => theme.colors.primary.main};
    color: white;
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    font-size: 1.6rem;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: ${({ theme }) => theme.colors.primary.dark};
    }
  }
`
