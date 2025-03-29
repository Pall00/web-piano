// src/components/ThemeToggle/ThemeToggle.styles.js
import styled from 'styled-components'

export const ToggleWrapper = styled.button`
  background: none;
  border: none;
  padding: 10px;
  cursor: pointer;
  outline: none;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`

export const ToggleTrack = styled.div`
  width: 40px;
  height: 20px;
  border-radius: 10px;
  background-color: ${({ $isDarkMode, theme }) =>
    $isDarkMode ? theme.colors.background.card : theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: ${({ $isDarkMode }) => ($isDarkMode ? 'flex-end' : 'flex-start')};
  transition: all 0.3s ease;
`

export const ToggleThumb = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary.main};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  transition: all 0.3s ease;
`

export const ToggleLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
  font-size: 1.2rem;
  display: ${({ $showLabel }) => ($showLabel ? 'block' : 'none')};
`
