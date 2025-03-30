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
`

export const PageTitle = styled.h1`
  margin-bottom: ${({ theme }) => theme.spacing(6)};
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
  font-size: 3rem;
`

export const FlashcardSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  min-height: 400px;
`

export const NoCardsMessage = styled.div`
  padding: ${({ theme }) => theme.spacing(6)};
  background-color: ${({ theme }) => theme.colors.background.card};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  text-align: center;
  font-size: 1.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing(4)};
`
