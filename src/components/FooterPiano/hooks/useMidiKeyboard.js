// src/components/FooterPiano/hooks/useMidiKeyboard.js
import { useState, useCallback, useRef, useEffect } from 'react'
import logger from '../../../utils/logger'
import { midiToNote } from '../../../utils/musicTheory'

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

  // Configure logger for MIDI events (high frequency)
  useEffect(() => {
    // Configure higher throttling for MIDI events
    logger.configure({
      throttleMs: 100, // Throttle similar MIDI logs to once per 100ms
      sampleRate: 1, // Log all events (can be increased if needed)
    })

    return () => {
      // Reset logger config when component unmounts
      logger.reset()
    }
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
          // Use lazy evaluation to avoid string concatenation when not needed
          logger.debug(() => `MIDI Sustain Pedal: ${isSustainOn ? 'ON' : 'OFF'} (value: ${value})`)

          if (onSustainChange) onSustainChange(isSustainOn)
          return
        }
        // Add more CC message handling here if needed
        return
      }

      // Note messages handling
      const noteName = midiToNote(data)
      if (!noteName) return // Invalid note

      // Note on event (command: 144-159 with velocity > 0)
      if (command >= 144 && command <= 159 && value > 0) {
        // Check if we've already processed this note
        if (!activeNotesRef.current.has(data)) {
          activeNotesRef.current.add(data)
          // Using lazy evaluation for high-frequency note events
          logger.debug(() => `MIDI Note On: ${noteName} (velocity: ${value})`)
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
          logger.debug(() => `MIDI Note Off: ${noteName}`)
          if (onNoteOff) onNoteOff(noteName)
        }
      }
    },
    [onNoteOn, onNoteOff, onSustainChange, isAudioReady],
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
      logger.warn('MIDI already initialized, skipping')
      return true
    }

    // Check if Web MIDI API is supported
    if (!navigator.requestMIDIAccess) {
      logger.warn('Web MIDI API is not supported in this browser')
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
          logger.warn('No MIDI devices found')
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

        logger.info(
          () => `Connected to MIDI device: ${device.name}${port1Device ? ' (Port-1)' : ''}`,
        )
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
            logger.info(() => `MIDI device connected: ${event.port.name}`)

            // Only attempt reconnection if we're not already connected
            if (!currentDeviceRef.current) {
              // If the newly connected device is Port-1, connect to it
              if (isPort1Device(event.port.name)) {
                logger.info('Port-1 device detected, connecting...')
                connectToDevice()
              } else if (!isMidiConnected) {
                // Connect to non-Port-1 device if not connected to anything
                connectToDevice()
              }
            }
          } else if (event.port.state === 'disconnected') {
            logger.warn(() => `MIDI device disconnected: ${event.port.name}`)

            // Only handle disconnection if it's our current device
            if (currentDeviceRef.current && currentDeviceRef.current.name === event.port.name) {
              // Clear active notes when device disconnects
              if (onNoteOff) {
                activeNotesRef.current.forEach(note => {
                  const noteName = midiToNote(note)
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
      logger.error('Failed to initialize MIDI:', error)
      return false
    }
  }, [handleMidiMessage, isMidiConnected, onNoteOff])

  /**
   * Force release all held notes
   */
  const releaseAllNotes = useCallback(() => {
    if (onNoteOff) {
      activeNotesRef.current.forEach(note => {
        const noteName = midiToNote(note)
        if (noteName) onNoteOff(noteName)
      })
    }
    activeNotesRef.current.clear()
  }, [onNoteOff])

  return {
    isMidiConnected,
    midiDeviceName,
    initializeMidi,
    releaseAllNotes,
  }
}

export default useMidiKeyboard
