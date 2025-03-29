// src/components/FooterPiano/FooterPiano.styles.js
// Add these new styled components
import styled, { keyframes } from 'styled-components'

export const PianoContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 160px;
  background-color: #222;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  z-index: 1000;

  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */

  @media (max-width: 768px) {
    height: 100px;
  }

  @media (max-width: 480px) {
    height: 80px;
  }
`

export const PianoUpperHousing = styled.div`
  height: 20%;
  width: 100%;
  background-color: #111;
  background-image: linear-gradient(to bottom, #0a0a0a, #222);
  box-shadow: inset 0 5px 10px rgba(0, 0, 0, 0.5);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 10px;
`

export const PianoFeltStrip = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 3px;
  background-color: #8b0000;
  background-image: linear-gradient(to right, #8b0000, #a52a2a, #8b0000);
`

export const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

export const WhiteKeysContainer = styled.div`
  display: flex;
  height: 80%; /* Changed from 100% to account for the upper housing */
  position: relative;
  min-width: max-content;
`

// Add styles for active state
export const WhiteKey = styled.div.attrs(props => ({
  style: {
    width: `${props.$width}px`,
  },
}))`
  height: 100%;
  background-color: ${props => (props.$active ? '#e0e8ff' : 'white')};
  border: 1px solid #ddd;
  border-radius: 0 0 4px 4px;
  box-sizing: border-box;
  position: relative;
  cursor: pointer;
  transition: background-color 0.1s ease;

  &:active {
    background-color: #e0e8ff;
  }
`

export const BlackKey = styled.div.attrs(props => ({
  style: {
    width: `${props.$width}px`,
    left: `${props.$position}px`,
  },
}))`
  position: absolute;
  height: 65%;
  background-color: ${props => (props.$active ? '#555' : '#222')};
  border-radius: 0 0 3px 3px;
  box-sizing: border-box;
  z-index: 1;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  transition: background-color 0.1s ease;

  &:active {
    background-color: #555;
  }
`

// Add Start Audio button
export const StartAudioButton = styled.button`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 12px 24px;
  background-color: #3e74bc;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1.2rem;
  cursor: pointer;

  &:hover {
    background-color: #2a4d7f;
  }
`

export const KeyLabel = styled.span`
  position: absolute;
  bottom: 5px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 10px;
  color: ${props => (props.$isBlack ? '#fff' : '#333')};
  pointer-events: none;
  display: ${props => (props.$showLabels ? 'block' : 'none')};
`
// Add spinning animation
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

// Add loading indicator styles
export const LoadingIndicator = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: white;
  font-size: 1.2rem;

  .spinner {
    width: 30px;
    height: 30px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: ${spin} 1s ease-in-out infinite;
  }
`

export const MidiIndicator = styled.div`
  padding: 4px 8px;
  background-color: rgba(0, 0, 0, 0.5);
  color: ${props => (props.$isPort1 ? '#4CAF50' : '#FFC107')};
  font-size: 12px;
  border-radius: 4px;

  &::before {
    content: '🎹';
    margin-right: 4px;
  }
`
