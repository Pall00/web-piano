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
  }

  /* Main content area with padding for the piano */
  .main-content {
    flex: 1;
    padding-top: 10rem; /* For header */
    padding-bottom: 12rem; /* Space for piano (120px) */
    
    @media (max-width: 768px) {
      padding-bottom: 10rem; /* 100px piano height on medium screens */
    }
    
    @media (max-width: 480px) {
      padding-bottom: 8rem; /* 80px piano height on small screens */
    }
  }

  /* Page content styling */
  .content-page {
    width: 90%;
    max-width: 1200px;
    margin: 0 auto;
  }

  /* Piano-specific global styles */
  .piano-key:active,
  .piano-key.active {
    transform: translateY(1px);
  }
`

export default GlobalStyles
