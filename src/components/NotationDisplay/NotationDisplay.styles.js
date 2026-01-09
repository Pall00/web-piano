import styled from 'styled-components'

export const NotationDisplayContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
  overflow: hidden;

  .error-message {
    color: ${({ theme }) => theme.colors.error};
    padding: ${({ theme }) => theme.spacing(4)};
    text-align: center;
    font-size: 1.8rem;
  }

  .loading-message {
    padding: ${({ theme }) => theme.spacing(4)};
    text-align: center;
    font-size: 1.8rem;
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`

export const HorizontalScrollContainer = styled.div`
  width: 100%;
  max-width: 100vw;
  overflow-x: auto;
  overflow-y: hidden;
  padding: ${({ theme }) => theme.spacing(2)};
  position: relative;
  display: block;

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background.card};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.primary.main};
    border-radius: 4px;

    &:hover {
      background: ${({ theme }) => theme.colors.primary.dark};
    }
  }
`

export const NotationCanvas = styled.div`
  min-height: 300px;
  margin-top: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  background-color: ${({ theme }) => theme.colors.background.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  box-sizing: border-box;
  overflow: visible;

  & > div {
    width: auto;
    overflow: visible;
  }

  & svg {
    display: block;
    height: auto !important;
  }
`

export const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.background.card};
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
    align-items: center;
    position: static;
  }
`

export const ZoomControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    margin-bottom: ${({ theme }) => theme.spacing(2)};
  }
`

export const ScoreSelectorControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
  flex-grow: 1;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    width: 100%;
    margin-bottom: ${({ theme }) => theme.spacing(2)};
    flex-wrap: wrap;
  }
`

export const CursorControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  flex-wrap: wrap;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    width: 100%;
    justify-content: center;
  }
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;

    &:hover {
      background-color: ${({ theme }) => theme.colors.background.card};
      border-color: ${({ theme }) => theme.colors.border};
    }
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

export const PlayButton = styled(NavigationButton)`
  background-color: ${({ theme, $isPlaying }) =>
    $isPlaying ? theme.colors.error : theme.colors.primary.main};
  color: white;
  border: none;
  min-width: 80px;

  &:hover {
    background-color: ${({ theme, $isPlaying }) =>
      $isPlaying ? '#d32f2f' : theme.colors.primary.dark};
    border-color: transparent;
  }
`

export const ZoomLevel = styled.div`
  padding: ${({ theme }) => theme.spacing(2)};
  width: 6rem;
  text-align: center;
  font-weight: 500;
  font-size: 1.6rem;
`

export const SettingsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(4)};
  margin-left: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: ${({ theme }) => theme.borderRadius.small};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    margin-left: 0;
    margin-top: ${({ theme }) => theme.spacing(2)};
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
`

export const SettingsToggle = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};

  input[type='checkbox'] {
    margin: 0;
  }

  label {
    font-size: 1.4rem;
    font-weight: 500;
    white-space: nowrap;
    user-select: none;
  }
`

export const TempoControl = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  background-color: ${({ theme }) => theme.colors.background.paper};
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  border: 1px solid ${({ theme }) => theme.colors.border};

  label {
    font-size: 1.4rem;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  input {
    width: 50px;
    padding: 4px;
    border: none;
    background: transparent;
    text-align: center;
    font-size: 1.4rem;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.primary.main};

    &:focus {
      outline: none;
    }
  }

  span {
    font-size: 1.2rem;
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`

export const SelectorLabel = styled.label`
  font-size: 1.6rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  white-space: nowrap;
`

export const Select = styled.select`
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
  font-size: 1.6rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  background-color: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  min-width: 200px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.hover};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    min-width: 0;
    width: 100%;
  }
`

export const UploadButton = styled.label`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
  background-color: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 1.6rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary.dark};
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.small};
  }

  &:active {
    transform: translateY(0);
  }
`

export const FileInput = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
`
