import styled from 'styled-components'

export const CardContainer = styled.div`
  width: 100%;
  max-width: 500px;
  height: 300px;
  perspective: 1000px;
  cursor: pointer;
  margin: 0 auto;
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    transform: scale(1.02);
    transition: transform 0.2s ease;
  }
`

export const CardInner = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1);
  transform-style: preserve-3d;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.medium};

  transform: ${({ $isFlipped }) => ($isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)')};
`

// Yleiset tyylit
const CardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  padding: ${({ theme }) => theme.spacing(3)};
  top: 0;
  left: 0;
`

// MUUTOS TÄSSÄ: Z-index vaihtuu propsin mukaan, mutta styled-componentsissa
// meidän täytyy hallita se CardInnerin kääntymisen kautta.
// Yksinkertaisempi tapa on poistaa kiinteä z-index kokonaan ja luottaa transform-styleen,
// tai asettaa z-index wrapperiin.
//
// Varmistetaan toimivuus asettamalla 'pointer-events' automaattisesti.

export const CardFront = styled(CardFace)`
  background-color: ${({ theme }) => theme.colors.background.card};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  transform: rotateY(0deg);
  /* Etupuoli on oletuksena päällä (z-index 2) */
  z-index: 2;
`

export const CardBack = styled(CardFace)`
  background-color: ${({ theme }) => theme.colors.primary.light || '#e3f2fd'};
  color: ${({ theme }) => theme.colors.text.primary};
  transform: rotateY(180deg);
  border: 1px solid ${({ theme }) => theme.colors.primary.main};
  /* Takapuoli on alla (z-index 1) */
  z-index: 1;
`

export const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  /* Varmistetaan että sisältö ei estä klikkausta */
  pointer-events: none;

  /* Palautetaan pointer-events nappeihin jos niitä on */
  button {
    pointer-events: auto;
  }

  h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    font-weight: bold;
  }

  p {
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`
