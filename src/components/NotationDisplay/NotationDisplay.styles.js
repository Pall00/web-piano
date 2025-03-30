// src/components/NotationDisplay/NotationDisplay.styles.js
import styled from 'styled-components'

export const NotationContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(2)};

  svg {
    max-width: 100%;
    height: auto;
    overflow: visible;
  }
`
