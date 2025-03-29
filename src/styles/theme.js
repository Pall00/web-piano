// src/styles/theme.js
const lightTheme = {
  colors: {
    primary: {
      main: '#3E74BC', // Piano blue
      light: '#6495ED', // Lighter blue
      dark: '#2A4D7F', // Darker blue
      hover: 'rgba(62, 116, 188, 0.1)',
    },
    secondary: {
      main: '#D06A4F', // Complementary orange/red
      light: '#E68A70',
      dark: '#B04A2F',
    },
    background: {
      main: '#F8F9FA', // Light background
      paper: '#FFFFFF', // White background
      card: '#F0F2F5', // Slightly off-white for cards
    },
    border: 'rgba(0, 0, 0, 0.1)',
    error: '#DC3545',
    success: '#28A745',
    text: {
      primary: '#212529',
      secondary: '#6C757D',
    },
  },
  spacing: (multiplier = 1) => `${0.4 * multiplier}rem`,
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
  },
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 8px rgba(0, 0, 0, 0.1)',
    large: '0 8px 16px rgba(0, 0, 0, 0.1)',
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
  },
}

const darkTheme = {
  colors: {
    primary: {
      main: '#5D8ED9', // Brighter blue for dark mode
      light: '#80A7E5',
      dark: '#3A5D8F',
      hover: 'rgba(93, 142, 217, 0.2)',
    },
    secondary: {
      main: '#E68A70', // Brighter orange for dark mode
      light: '#F0A590',
      dark: '#C06A50',
    },
    background: {
      main: '#121212', // Very dark gray
      paper: '#1E1E1E', // Dark gray
      card: '#2D2D2D', // Medium-dark gray
    },
    border: 'rgba(255, 255, 255, 0.1)',
    error: '#F55A4E',
    success: '#4CAF50',
    text: {
      primary: '#E0E0E0',
      secondary: '#AAAAAA',
    },
  },
  spacing: lightTheme.spacing,
  breakpoints: lightTheme.breakpoints,
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.3)',
    medium: '0 4px 8px rgba(0, 0, 0, 0.4)',
    large: '0 8px 16px rgba(0, 0, 0, 0.5)',
  },
  borderRadius: lightTheme.borderRadius,
}

export const extendTheme = (theme, isDarkMode) => {
  return {
    ...theme,
    isDarkMode,
  }
}

export { lightTheme, darkTheme }
export default lightTheme
