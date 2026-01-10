import styled from 'styled-components'
import { motion } from 'framer-motion'

// Pääkonttori, joka lukitsee näkymän viewportin korkeuteen
export const NotationContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 320px; /* Vasen: auto, Oikea: kiinteä 320px */
  grid-template-rows: 1fr;
  height: calc(100vh - 180px); /* Arvioitu korkeus (100vh - header - footer) */
  width: 100%;
  max-width: 100vw;
  margin: 0;
  padding: 0;
  overflow: hidden; /* Estää koko sivun rullauksen */
  background-color: ${({ theme }) => theme.colors.background.default};

  /* Mobiiliresponsiivisuus: pinotaan päällekkäin */
  @media (max-width: 1024px) {
    grid-template-columns: 1fr 280px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;
    height: auto; /* Mobiilissa annetaan kasvaa pituutta */
    overflow: visible;
  }
`

// Vasen sarake: Nuotit ja kontrollit
export const ScoreArea = styled.div`
  position: relative;
  overflow-y: auto; /* Vain tämä alue rullaa pystysuunnassa */
  overflow-x: hidden;
  background: white;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;

  /* Kustomoitu scrollbar */
  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 5px;
    &:hover {
      background: #bbb;
    }
  }
`

// Oikea sarake: Sivupalkki infolle
export const Sidebar = styled.div`
  padding: ${({ theme }) => theme.spacing(3)};
  background-color: #f8f9fa;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  box-shadow: inset 5px 0 10px -5px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    max-height: 300px;
    box-shadow: 0 -5px 10px -5px rgba(0, 0, 0, 0.05);
  }
`

// Wrappers (poistettu turhia, pidetty tarpeelliset)
export const NotationWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`

export const PageTitle = styled.h2`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing(2)} 0;
  padding-bottom: ${({ theme }) => theme.spacing(1)};
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary.main};
`

// --- InfoPanel ja muut komponentit (päivitetty sopimaan sivupalkkiin) ---

export const InfoPanel = styled(motion.div)`
  background-color: white;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing(2)};
  box-shadow: ${({ theme }) => theme.shadows.small};
  border: 1px solid ${({ theme }) => theme.colors.border};

  h3 {
    margin-top: 0;
    margin-bottom: ${({ theme }) => theme.spacing(2)};
    font-size: 1.6rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`

export const MatchStatus = styled(motion.span)`
  color: ${({ theme }) => theme.colors.success};
  background: rgba(76, 175, 80, 0.1);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

export const NoteList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column; /* Pystysuuntainen lista sivupalkissa */
  gap: ${({ theme }) => theme.spacing(1)};
`

export const NoteItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(1.5)};
  border-radius: ${({ theme }) => theme.borderRadius.small};

  /* Dynaaminen taustaväri tilan mukaan */
  background-color: ${({ $isCorrect, $isPressed, $isTied }) => {
    if ($isTied) return 'rgba(0,0,0,0.03)'
    if ($isCorrect) return 'rgba(76, 175, 80, 0.15)'
    if ($isPressed) return 'rgba(33, 150, 243, 0.15)'
    return 'white'
  }};

  border: 1px solid
    ${({ theme, $isCorrect, $isPressed, $isTied }) => {
      if ($isTied) return 'transparent'
      if ($isCorrect) return theme.colors.success
      if ($isPressed) return theme.colors.primary.main
      return theme.colors.border
    }};

  border-left-width: 4px; /* Korostetaan vasenta reunaa */

  opacity: ${({ $isTied }) => ($isTied ? 0.6 : 1)};
  transition: all 0.2s ease;

  .note-name {
    font-weight: 800;
    font-size: 1.8rem;
    color: ${({ theme, $isCorrect, $isPressed }) => {
      if ($isCorrect) return theme.colors.success
      if ($isPressed) return theme.colors.primary.main
      return theme.colors.text.primary
    }};
  }

  .note-details {
    font-size: 1.2rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    font-family: monospace;
  }
`
