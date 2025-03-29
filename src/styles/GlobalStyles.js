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
`

export default GlobalStyles
