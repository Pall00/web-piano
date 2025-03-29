// src/components/ThemeToggle/ThemeToggle.jsx
import { useTheme } from '../../hooks/useTheme'
import { ToggleWrapper, ToggleTrack, ToggleThumb, ToggleLabel } from './ThemeToggle.styles'

const ThemeToggle = ({ showLabel = false }) => {
  const { isDarkMode, toggleTheme } = useTheme()

  return (
    <ToggleWrapper onClick={toggleTheme} aria-label="Toggle theme">
      <ToggleTrack $isDarkMode={isDarkMode}>
        <ToggleThumb>{isDarkMode ? '🌙' : '☀️'}</ToggleThumb>
      </ToggleTrack>
      {showLabel && (
        <ToggleLabel $showLabel={showLabel}>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</ToggleLabel>
      )}
    </ToggleWrapper>
  )
}

export default ThemeToggle
