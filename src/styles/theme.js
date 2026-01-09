// src/styles/theme.js
const lightTheme = {
  colors: {
    primary: {
      main: '#3E74BC',
      light: '#6495ED',
      dark: '#2A4D7F',
      hover: 'rgba(62, 116, 188, 0.1)',
    },
    // UUSI: Ohjausvärit (Guidance)
    guidance: {
      main: '#00C2FF', // Kirkas sähkönsininen/syaani
      light: '#E0F7FA',
      dark: '#0097A7',
      glow: '0 0 15px rgba(0, 194, 255, 0.6), 0 0 5px rgba(0, 194, 255, 0.8)', // Hohto
    },
    secondary: {
      main: '#D06A4F',
      light: '#E68A70',
      dark: '#B04A2F',
    },
    background: {
      main: '#F8F9FA',
      paper: '#FFFFFF',
      card: '#F0F2F5',
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
      main: '#5D8ED9',
      light: '#80A7E5',
      dark: '#3A5D8F',
      hover: 'rgba(93, 142, 217, 0.2)',
    },
    // UUSI: Ohjausvärit tummaan teemaan (hieman kirkkaampi hohto)
    guidance: {
      main: '#00E5FF', // Vielä kirkkaampi syaani tummalle taustalle
      light: '#80DEEA',
      dark: '#00B8D4',
      glow: '0 0 20px rgba(0, 229, 255, 0.7), 0 0 8px rgba(0, 229, 255, 1)',
    },
    secondary: {
      main: '#E68A70',
      light: '#F0A590',
      dark: '#C06A50',
    },
    background: {
      main: '#121212',
      paper: '#1E1E1E',
      card: '#2D2D2D',
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
