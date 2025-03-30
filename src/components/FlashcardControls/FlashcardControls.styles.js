// src/components/FlashcardControls/FlashcardControls.styles.js
import styled from 'styled-components'

export const ControlsContainer = styled.div`
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing(4)};
`

export const ControlsInner = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`

export const NavButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(5)};
  font-size: 1.6rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary.dark};
  }

  /* Different styles for prev/next buttons */
  ${({ $direction }) =>
    $direction === 'prev'
      ? `
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    `
      : `
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    `}

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
    font-size: 1.4rem;
  }
`

export const ProgressIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
  background-color: ${({ theme }) => theme.colors.background.card};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  min-width: 100px;
  text-align: center;
`

export const ProgressText = styled.span`
  font-size: 1.4rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
`
