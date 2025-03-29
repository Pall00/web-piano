// src/components/FooterPiano/FooterPiano.styles.js
import styled from 'styled-components'

export const PianoContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 120px;
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

export const WhiteKeysContainer = styled.div`
  display: flex;
  height: 100%;
  position: relative;
  min-width: max-content;
`

// Using .attrs for frequently changed styles
export const WhiteKey = styled.div.attrs(props => ({
  style: {
    width: `${props.$width}px`,
  },
}))`
  height: 100%;
  background-color: white;
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

// Using .attrs for frequently changed styles
export const BlackKey = styled.div.attrs(props => ({
  style: {
    width: `${props.$width}px`,
    left: `${props.$position}px`,
  },
}))`
  position: absolute;
  height: 65%;
  background-color: #222;
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
