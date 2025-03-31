// src/components/NotationDisplay/NotationDisplay.styles.js
import styled from 'styled-components'

export const NotationDisplayContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: ${({ theme }) => theme.spacing(4)};
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};

  .error-message {
    color: ${({ theme }) => theme.colors.error};
    padding: ${({ theme }) => theme.spacing(4)};
    text-align: center;
    font-size: 1.8rem;
  }
`

export const NotationCanvas = styled.div`
  width: 100%;
  min-height: 300px;
  margin-top: ${({ theme }) => theme.spacing(4)};
  background-color: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  overflow: auto;

  /* Force osmd to not overflow the container */
  & > div {
    max-width: 100%;
  }
`

export const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(4)};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
    align-items: center;
  }
`

export const ZoomControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`

export const CursorControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`

export const Button = styled.button`
  background-color: ${({ theme }) => theme.colors.background.card};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: ${({ theme }) => theme.spacing(2)};
  font-size: 1.6rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.6rem;
  height: 3.6rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary.hover};
    border-color: ${({ theme }) => theme.colors.primary.main};
  }

  .icon {
    font-size: 2rem;
  }
`

export const NavigationButton = styled(Button)`
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
  width: auto;
  font-weight: 500;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.small};
  }

  &:active {
    transform: translateY(0);
  }
`

export const ZoomLevel = styled.div`
  padding: ${({ theme }) => theme.spacing(2)};
  width: 6rem;
  text-align: center;
  font-weight: 500;
  font-size: 1.6rem;
`
