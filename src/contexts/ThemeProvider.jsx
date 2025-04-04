// src/contexts/ThemeProvider.jsx
import { useState, useEffect } from 'react'
import { ThemeProvider as StyledThemeProvider } from 'styled-components'
import { lightTheme, darkTheme, extendTheme } from '../styles/theme'
import { ThemeContext } from './themeContext'

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    return savedTheme === 'dark'
  })

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  const theme = isDarkMode ? darkTheme : lightTheme
  const extendedTheme = extendTheme(theme, isDarkMode)

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <StyledThemeProvider theme={extendedTheme}>{children}</StyledThemeProvider>
    </ThemeContext.Provider>
  )
}

export default ThemeProvider
