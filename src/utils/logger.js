// src/utils/logger.js
const isProduction = process.env.NODE_ENV === 'production'

// Configuration (with defaults)
let config = {
  includeTimestamps: true, // Include ISO timestamps in logs
  throttleMs: 1000, // Throttle duplicate logs (ms)
  sampleRate: 1, // Log every Nth message (1 = log all)
}

// Tracking state for performance optimizations
const throttleCache = new Map()
const sampleCounters = new Map()

// Format timestamp
const getTimestamp = () => {
  return config.includeTimestamps ? `[${new Date().toISOString()}] ` : ''
}

// Evaluate lazy messages
const evaluateMessage = message => {
  if (typeof message === 'function') {
    try {
      return message()
    } catch (error) {
      return `[Error evaluating log message: ${error.message}]`
    }
  }
  return message
}

// Handle message sampling and throttling
const shouldLog = (level, message) => {
  // Always log errors and critical
  if (level === 'error' || level === 'critical') return true

  const key = `${level}:${message}`
  const now = Date.now()

  // Throttling: Don't log again if it's within throttle time
  const lastLog = throttleCache.get(key) || 0
  if (now - lastLog < config.throttleMs) {
    return false
  }

  // Sampling: Only log every Nth message
  const counter = (sampleCounters.get(key) || 0) + 1
  sampleCounters.set(key, counter % config.sampleRate)

  if (sampleCounters.get(key) !== 0) {
    return false
  }

  // Update throttle cache
  throttleCache.set(key, now)
  return true
}

const logger = {
  // Configure logger settings
  configure: newConfig => {
    config = { ...config, ...newConfig }
  },

  debug: (message, ...args) => {
    if (isProduction) return

    const evaluated = evaluateMessage(message)
    if (shouldLog('debug', evaluated)) {
      console.log(`${getTimestamp()}[DEBUG] ${evaluated}`, ...args)
    }
  },

  info: (message, ...args) => {
    if (isProduction) return

    const evaluated = evaluateMessage(message)
    if (shouldLog('info', evaluated)) {
      console.info(`${getTimestamp()}[INFO] ${evaluated}`, ...args)
    }
  },

  warn: (message, ...args) => {
    if (isProduction) return

    const evaluated = evaluateMessage(message)
    if (shouldLog('warn', evaluated)) {
      console.warn(`${getTimestamp()}[WARN] ${evaluated}`, ...args)
    }
  },

  error: (message, ...args) => {
    // Always log errors, even in production
    const evaluated = evaluateMessage(message)
    console.error(`${getTimestamp()}[ERROR] ${evaluated}`, ...args)
  },

  // For critical logs that should always appear
  critical: (message, ...args) => {
    const evaluated = evaluateMessage(message)
    console.error(`${getTimestamp()}[CRITICAL] ${evaluated}`, ...args)
  },

  // Reset all internal state (useful for tests)
  reset: () => {
    throttleCache.clear()
    sampleCounters.clear()
  },
}

export default logger
