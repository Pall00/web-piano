// src/pages/Notation/Notation.styles.js
import styled from 'styled-components'

export const NotationContainer = styled.div`
  padding-top: 0.5rem;
  padding-bottom: 2rem;
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-x: hidden;
`

export const PageTitle = styled.h1`
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
  font-size: 3rem;
  width: 100%;
`

export const NotationSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
`

// Updated wrapper component to ensure proper containment and scrolling
export const NotationWrapper = styled.div`
  width: 100%;
  max-width: 100%; // Ensure it doesn't exceed screen width
  overflow-x: auto; // Enable horizontal scrolling
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};

  /* Responsive adjustments */
  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    width: 100%;
    margin-left: auto;
    margin-right: auto;
  }

  /* Adjust for mobile */
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    max-width: 95%;
    margin-left: auto;
    margin-right: auto;
  }
`

export const InfoPanel = styled.div`
  padding: ${({ theme }) => theme.spacing(4)};
  background-color: ${({ theme }) => theme.colors.background.card};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.border};
  margin-top: ${({ theme }) => theme.spacing(4)};
  width: 100%;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;

  h3 {
    font-size: 2rem;
    margin-bottom: ${({ theme }) => theme.spacing(4)};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    font-size: 1.6rem;
    padding: ${({ theme }) => theme.spacing(2)};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};

    &:last-child {
      border-bottom: none;
    }
  }
`
