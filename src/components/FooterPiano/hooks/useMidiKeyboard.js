// src/components/FooterPiano/hooks/useMidiKeyboard.js
import { useState, useEffect, useCallback } from 'react'

/**
 * A simplified hook for connecting to MIDI keyboards
 * Automatically connects to the first available MIDI device
 */
const useMidiKeyboard = ({ onNoteOn, onNoteOff }) => {
  const [isMidiConnected, setIsMidiConnected] = useState(false)
  const [midiDeviceName, setMidiDeviceName] = useState('')

  // Minimal MIDI note number to note name mapping
  const midiNoteToNoteName = useCallback(midiNote => {
    // Standard note names for piano range (A0-C8)
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

    // Calculate note name and octave based on MIDI note number
    const octave = Math.floor(midiNote / 12) - 1
    const noteName = noteNames[midiNote % 12]

    // Handle special cases for the piano range
    if (midiNote >= 21 && midiNote <= 108) {
      // Convert A0 (21) to C8 (108) range properly
      if (midiNote < 24) {
        // Handle A0 (21), A#0 (22), B0 (23)
        return `${noteName}0`
      } else {
        return `${noteName}${octave}`
      }
    }
    return null
  }, [])

  /**
   * Handles incoming MIDI messages
   */
  const handleMidiMessage = useCallback(
    event => {
      // Extract MIDI data: [command, note, velocity]
      const [command, note, velocity] = event.data

      // Note on event (command: 144-159)
      if (command >= 144 && command <= 159 && velocity > 0) {
        const noteName = midiNoteToNoteName(note)
        if (noteName && onNoteOn) {
          onNoteOn(noteName)
        }
      }
      // Note off event (command: 128-143 or note-on with velocity 0)
      else if (
        (command >= 128 && command <= 143) ||
        (command >= 144 && command <= 159 && velocity === 0)
      ) {
        const noteName = midiNoteToNoteName(note)
        if (noteName && onNoteOff) {
          onNoteOff(noteName)
        }
      }
    },
    [onNoteOn, onNoteOff, midiNoteToNoteName],
  )

  /**
   * Helper function to identify Port-1 type devices
   */
  const isPort1Device = deviceName => {
    if (!deviceName) return false

    const name = deviceName.toLowerCase()
    return (
      name.includes('port1') ||
      name.includes('port 1') ||
      name.includes('midi 1') ||
      name.includes('midi1') ||
      name === 'port 1' ||
      name === 'midi 1' ||
      (name.includes('midi') && name.includes('1'))
    )
  }

  /**
   * Initialize WebMIDI and connect to Port-1 first, then other devices
   */
  const initializeMidi = useCallback(async () => {
    // Check if Web MIDI API is supported
    if (!navigator.requestMIDIAccess) {
      console.warn('Web MIDI API is not supported in this browser')
      return false
    }

    try {
      // Request MIDI access
      const midiAccess = await navigator.requestMIDIAccess()

      // Function to connect to a preferred device
      const connectToDevice = () => {
        const inputs = Array.from(midiAccess.inputs.values())
        if (inputs.length === 0) {
          console.log('No MIDI devices found')
          setIsMidiConnected(false)
          setMidiDeviceName('')
          return false
        }

        // First try to find a Port-1 device
        const port1Device = inputs.find(input => isPort1Device(input.name))

        // Connect to Port-1 if found, otherwise use the first available device
        const device = port1Device || inputs[0]

        device.onmidimessage = handleMidiMessage
        setMidiDeviceName(device.name || 'MIDI Keyboard')
        setIsMidiConnected(true)
        console.log(`Connected to MIDI device: ${device.name}${port1Device ? ' (Port-1)' : ''}`)
        return true
      }

      // Try to connect to preferred device
      connectToDevice()

      // Set up connection/disconnection event handlers
      midiAccess.onstatechange = event => {
        if (event.port.type === 'input') {
          if (event.port.state === 'connected') {
            console.log(`MIDI device connected: ${event.port.name}`)

            // If the newly connected device is Port-1, prioritize connecting to it
            if (isPort1Device(event.port.name)) {
              console.log('Port-1 device detected, prioritizing connection')
              // Small timeout to ensure the device is ready
              setTimeout(() => connectToDevice(), 100)
            } else if (!isMidiConnected) {
              // Only connect to non-Port-1 device if we're not connected to anything
              connectToDevice()
            }
          } else if (event.port.state === 'disconnected') {
            console.log(`MIDI device disconnected: ${event.port.name}`)
            // If our current device was disconnected
            if (midiDeviceName === event.port.name) {
              setIsMidiConnected(false)
              setMidiDeviceName('')
              // Try to connect to another device if available
              connectToDevice()
            }
          }
        }
      }

      return true
    } catch (error) {
      console.error('Failed to initialize MIDI:', error)
      return false
    }
  }, [handleMidiMessage, midiDeviceName])

  return {
    isMidiConnected,
    midiDeviceName,
    initializeMidi,
  }
}

export default useMidiKeyboard
