// src/components/FooterPiano/FooterPiano.styles.js
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

  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;

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
  height: 80%;
  position: relative;
  min-width: max-content;
`

// PÄIVITETTY: WhiteKey - Hohtoefekti
export const WhiteKey = styled.div.attrs(props => ({
  style: {
    width: `${props.$width}px`,
  },
}))`
  height: 100%;
  /* Käytä teeman guidance-väriä kun aktiivinen */
  background-color: ${props => (props.$active ? props.theme.colors.guidance.main : 'white')};

  /* Lisää hohto kun aktiivinen */
  box-shadow: ${props => (props.$active ? props.theme.colors.guidance.glow : 'none')};

  /* Nosta aktiivinen kosketin muiden päälle jotta hohto näkyy */
  z-index: ${props => (props.$active ? 2 : 0)};

  /* Poista reunus aktiivisena jotta väri on puhtaampi, tai pidä kevyenä */
  border: ${props =>
    props.$active ? `1px solid ${props.theme.colors.guidance.dark}` : '1px solid #ddd'};

  border-radius: 0 0 4px 4px;
  box-sizing: border-box;
  position: relative;
  cursor: pointer;
  transition:
    background-color 0.05s ease,
    box-shadow 0.05s ease;

  &:active {
    background-color: ${props => props.theme.colors.guidance.light};
  }
`

// PÄIVITETTY: BlackKey - Hohtoefekti
export const BlackKey = styled.div.attrs(props => ({
  style: {
    width: `${props.$width}px`,
    left: `${props.$position}px`,
  },
}))`
  position: absolute;
  height: 65%;

  /* Käytä teeman guidance-väriä kun aktiivinen */
  background-color: ${props => (props.$active ? props.theme.colors.guidance.main : '#222')};

  /* Lisää voimakas hohto */
  box-shadow: ${props =>
    props.$active ? props.theme.colors.guidance.glow : '0 2px 5px rgba(0, 0, 0, 0.5)'};

  border-radius: 0 0 3px 3px;
  box-sizing: border-box;

  /* Nosta musta kosketin aina valkoisten päälle, mutta aktiivinen musta vielä ylemmäs */
  z-index: ${props => (props.$active ? 10 : 5)};

  cursor: pointer;
  transition:
    background-color 0.05s ease,
    box-shadow 0.05s ease;

  &:active {
    background-color: #555;
  }
`

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

export const KeyLabel = styled.div`
  position: absolute;
  bottom: 5px;
  left: 0;
  right: 0;
  text-align: center;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 20; /* Varmista että teksti on aina päällä */

  ${props =>
    props.$isBlack &&
    `
    bottom: 3px;
  `}
`

export const NoteName = styled.span`
  font-size: 12px;
  font-weight: 600;
  /* Muuta tekstin väriä jos kosketin on aktiivinen, jotta kontrasti säilyy */
  color: ${props => {
    if (props.$isBlack) {
      // Mustalla koskettimella: Jos aktiivinen (syaani tausta) -> musta teksti, muuten valkoinen
      return props.$active ? '#000' : '#fff'
    } else {
      // Valkoisella koskettimella: Aina tumma teksti
      return '#222'
    }
  }};

  line-height: 1;
  display: block;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
`

export const OctaveNumber = styled.span`
  font-size: 9px;
  color: ${props => {
    if (props.$isBlack) {
      return props.$active ? '#333' : '#ccc'
    } else {
      return '#666'
    }
  }};
  line-height: 1;
  display: block;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
`

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

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

export const SustainIndicator = styled.div`
  padding: 4px 8px;
  background-color: rgba(0, 0, 0, 0.5);
  font-size: 12px;
  border-radius: 4px;
  margin-left: 8px;
  transition: color 0.2s ease;
  color: #aaaaaa;

  &.active {
    color: #4caf50;
  }

  &::before {
    content: '🎹';
    margin-right: 4px;
  }
`
