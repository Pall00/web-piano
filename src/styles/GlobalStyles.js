// src/styles/GlobalStyles.js
import { createGlobalStyle } from 'styled-components'

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  html {
    font-size: 62.5%; /* 1rem = 10px */
  }
  
  body {
    font-family: 'Roboto', sans-serif;
    font-size: 1.6rem;
    line-height: 1.5;
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.background.default};
    overflow-x: hidden; /* Prevent horizontal scrolling at the body level */
  }
  
  h1, h2, h3, h4, h5, h6 {
    margin-bottom: 1.6rem;
  }
  
  p {
    margin-bottom: 1.6rem;
  }

  /* App container to position the piano properly */
  .app-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    position: relative;
    width: 100%;
  }

  /* Main content area with padding for the piano */
  .main-content {
    flex: 1;
    padding-top: 10rem; /* For header */
    padding-bottom: 12rem; /* Space for piano (120px) */
    width: 100%;
    
    @media (max-width: 768px) {
      padding-bottom: 10rem; /* 100px piano height on medium screens */
    }
    
    @media (max-width: 480px) {
      padding-bottom: 8rem; /* 80px piano height on small screens */
    }
  }

  /* Page content styling - default constraint for most pages */
  .content-page {
    width: 90%;
    max-width: 1200px;
    margin: 0 auto;
  }

  /* Notation-specific overrides to allow wide display */
  .notation-page {
    width: 100%;
    max-width: 100%;
    padding: 0 2rem;
    overflow-x: visible;
  }

  /* Specific OpenSheetMusicDisplay overrides */
  #osmdCanvasDiv, 
  .osmd-container {
    width: 100%;
    max-width: none !important;
    box-sizing: content-box !important;
    
    & > div, & > svg {
      max-width: none !important;
    }
  }

  /* Allow horizontal scrolling containers to work properly */
  .horizontal-scroll-container {
    overflow-x: auto;
    width: 100%;
    padding-bottom: 1rem; /* Space for scrollbar */
  }

  /* Piano-specific global styles */
  .piano-key:active,
  .piano-key.active {
    transform: translateY(1px);
  }
`

export default GlobalStyles
