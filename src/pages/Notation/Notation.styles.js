import styled from 'styled-components'
import { motion } from 'framer-motion'

export const NotationContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(2)};
  gap: ${({ theme }) => theme.spacing(4)};
`

export const PageTitle = styled.h1`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  text-align: center;
`

export const NotationSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`

export const NotationWrapper = styled.div`
  width: 100%;
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  overflow: hidden;
`

// Uudistettu InfoPanel (parempi ulkoasu)
export const InfoPanel = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.card};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing(3)};
  box-shadow: ${({ theme }) => theme.shadows.small};
  border-left: 5px solid ${({ theme }) => theme.colors.primary.main};

  h3 {
    margin-top: 0;
    margin-bottom: ${({ theme }) => theme.spacing(2)};
    font-size: 1.8rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`

export const MatchStatus = styled(motion.span)`
  color: ${({ theme }) => theme.colors.success};
  background: rgba(76, 175, 80, 0.1);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 1.4rem;
  font-weight: bold;
`

export const NoteList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(2)};
`

export const NoteItem = styled.li`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  background-color: ${({ theme, $isCorrect, $isPressed, $isTied }) => {
    if ($isTied) return 'rgba(0,0,0,0.05)' // Haalea harmaa
    if ($isCorrect) return 'rgba(76, 175, 80, 0.2)' // Vihreä tausta
    if ($isPressed) return 'rgba(33, 150, 243, 0.2)' // Sininen tausta
    return theme.colors.background.paper
  }};

  border: 1px solid
    ${({ theme, $isCorrect, $isPressed, $isTied }) => {
      if ($isTied) return 'transparent'
      if ($isCorrect) return theme.colors.success
      if ($isPressed) return theme.colors.primary.main
      return theme.colors.border
    }};

  opacity: ${({ $isTied }) => ($isTied ? 0.6 : 1)};
  text-decoration: ${({ $isTied }) => ($isTied ? 'line-through' : 'none')};
  transition: all 0.2s ease;

  .note-name {
    font-weight: bold;
    font-size: 1.6rem;
    color: ${({ theme, $isCorrect, $isPressed }) => {
      if ($isCorrect) return theme.colors.success
      if ($isPressed) return theme.colors.primary.main
      return theme.colors.text.primary
    }};
  }

  .note-details {
    font-size: 1.2rem;
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`
