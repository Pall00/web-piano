// src/hooks/useFlashcards.js
import { useContext } from 'react'
import { FlashcardContext } from '../contexts/flashcardContext'

export const useFlashcards = () => useContext(FlashcardContext)
