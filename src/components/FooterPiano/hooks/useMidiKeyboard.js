// src/components/FooterPiano/hooks/useMidiKeyboard.js
import { useState, useCallback, useRef } from 'react'
import logger from '../../../utils/logger'

/**
 * A hook for connecting to MIDI keyboards with sustain pedal support
 */
const useMidiKeyboard = ({
  onNoteOn,
  onNoteOff,
  onSustainChange, // New callback for sustain pedal
  isAudioReady = false,
}) => {
  const [isMidiConnected, setIsMidiConnected] = useState(false)
  const [midiDeviceName, setMidiDeviceName] = useState('')

  // Use refs to prevent duplicate connections and messages
  const midiAccessRef = useRef(null)
  const currentDeviceRef = useRef(null)
  const isInitializedRef = useRef(false)

  // Track active notes to prevent duplicates
  const activeNotesRef = useRef(new Set())

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
      // Skip processing if audio isn't ready
      if (!isAudioReady) {
        return
      }

      // Extract MIDI data: [command, data, value]
      const [command, data, value] = event.data

      // Handle Control Change messages (command: 176-191)
      if (command >= 176 && command <= 191) {
        // CC #64 is the sustain pedal
        if (data === 64) {
          // Sustain pedal values: >= 64 is on, < 64 is off
          const isSustainOn = value >= 64
          logger.debug(`MIDI Sustain Pedal: ${isSustainOn ? 'ON' : 'OFF'} (value: ${value})`)

          if (onSustainChange) onSustainChange(isSustainOn)
          return
        }
        // Add more CC message handling here if needed
        return
      }

      // Note messages handling (existing code)
      const noteName = midiNoteToNoteName(data)
      if (!noteName) return // Invalid note

      // Note on event (command: 144-159 with velocity > 0)
      if (command >= 144 && command <= 159 && value > 0) {
        // Check if we've already processed this note
        if (!activeNotesRef.current.has(data)) {
          activeNotesRef.current.add(data)
          logger.debug(`MIDI Note On: ${noteName} (velocity: ${value})`)
          if (onNoteOn) onNoteOn(noteName)
        }
      }
      // Note off event (command: 128-143 or note-on with velocity 0)
      else if (
        (command >= 128 && command <= 143) ||
        (command >= 144 && command <= 159 && value === 0)
      ) {
        if (activeNotesRef.current.has(data)) {
          activeNotesRef.current.delete(data)
          logger.debug(`MIDI Note Off: ${noteName}`)
          if (onNoteOff) onNoteOff(noteName)
        }
      }
    },
    [onNoteOn, onNoteOff, onSustainChange, midiNoteToNoteName, isAudioReady],
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
    // Prevent multiple initializations
    if (isInitializedRef.current) {
      console.warn('MIDI already initialized, skipping')
      return true
    }

    // Check if Web MIDI API is supported
    if (!navigator.requestMIDIAccess) {
      console.warn('Web MIDI API is not supported in this browser')
      return false
    }

    try {
      // Request MIDI access
      const midiAccess = await navigator.requestMIDIAccess()
      midiAccessRef.current = midiAccess

      // Function to connect to a preferred device
      const connectToDevice = () => {
        // Skip if we already have a connection
        if (currentDeviceRef.current) {
          return true
        }

        const inputs = Array.from(midiAccess.inputs.values())
        if (inputs.length === 0) {
          console.warn('No MIDI devices found')
          setIsMidiConnected(false)
          setMidiDeviceName('')
          return false
        }

        // First try to find a Port-1 device
        const port1Device = inputs.find(input => isPort1Device(input.name))

        // Connect to Port-1 if found, otherwise use the first available device
        const device = port1Device || inputs[0]

        // Store the device
        currentDeviceRef.current = device

        // Clear active notes on device change
        activeNotesRef.current.clear()

        // Set up the message handler
        device.onmidimessage = handleMidiMessage

        // Update state
        setMidiDeviceName(device.name || 'MIDI Keyboard')
        setIsMidiConnected(true)

        console.warn(`Connected to MIDI device: ${device.name}${port1Device ? ' (Port-1)' : ''}`)
        return true
      }

      // Try to connect to preferred device
      connectToDevice()

      // Clean up any previous state change handlers
      if (midiAccess.onstatechange) {
        midiAccess.onstatechange = null
      }

      // Set up connection/disconnection event handlers
      midiAccess.onstatechange = event => {
        if (event.port.type === 'input') {
          if (event.port.state === 'connected') {
            console.warn(`MIDI device connected: ${event.port.name}`)

            // Only attempt reconnection if we're not already connected
            if (!currentDeviceRef.current) {
              // If the newly connected device is Port-1, connect to it
              if (isPort1Device(event.port.name)) {
                console.warn('Port-1 device detected, connecting...')
                connectToDevice()
              } else if (!isMidiConnected) {
                // Connect to non-Port-1 device if not connected to anything
                connectToDevice()
              }
            }
          } else if (event.port.state === 'disconnected') {
            console.warn(`MIDI device disconnected: ${event.port.name}`)

            // Only handle disconnection if it's our current device
            if (currentDeviceRef.current && currentDeviceRef.current.name === event.port.name) {
              // Clear active notes when device disconnects
              if (onNoteOff) {
                activeNotesRef.current.forEach(note => {
                  const noteName = midiNoteToNoteName(note)
                  if (noteName) onNoteOff(noteName)
                })
              }
              activeNotesRef.current.clear()

              setIsMidiConnected(false)
              setMidiDeviceName('')
              currentDeviceRef.current = null

              // Try to connect to another device if available
              connectToDevice()
            }
          }
        }
      }

      isInitializedRef.current = true
      return true
    } catch (error) {
      console.error('Failed to initialize MIDI:', error)
      return false
    }
  }, [handleMidiMessage, isMidiConnected, midiNoteToNoteName, onNoteOff])

  /**
   * Force release all held notes
   */
  const releaseAllNotes = useCallback(() => {
    if (onNoteOff) {
      activeNotesRef.current.forEach(note => {
        const noteName = midiNoteToNoteName(note)
        if (noteName) onNoteOff(noteName)
      })
    }
    activeNotesRef.current.clear()
  }, [midiNoteToNoteName, onNoteOff])

  return {
    isMidiConnected,
    midiDeviceName,
    initializeMidi,
    releaseAllNotes,
  }
}

export default useMidiKeyboard
