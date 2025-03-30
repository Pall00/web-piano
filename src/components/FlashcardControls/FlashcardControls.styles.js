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
  gap: ${({ theme }) => theme.spacing(3)};
`

export const NavButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(5)};
  font-size: 1.6rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  max-width: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(2)};
  box-shadow: ${({ theme }) =>
    theme.isDarkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)'};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary.dark};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) =>
      theme.isDarkMode ? '0 6px 8px rgba(0, 0, 0, 0.4)' : '0 4px 8px rgba(0, 0, 0, 0.15)'};
  }

  &:active {
    transform: translateY(1px);
    box-shadow: none;
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
  background-color: ${({ theme }) =>
    theme.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : theme.colors.background.card};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  min-width: 100px;
  text-align: center;
  box-shadow: ${({ theme }) =>
    theme.isDarkMode ? 'inset 0 1px 3px rgba(0, 0, 0, 0.3)' : 'inset 0 1px 3px rgba(0, 0, 0, 0.1)'};
`

export const ProgressText = styled.span`
  font-size: 1.4rem;
  font-weight: 500;
  color: ${({ theme }) =>
    theme.isDarkMode ? theme.colors.text.primary : theme.colors.text.secondary};
`
