// src/utils/logger.js
const isProduction = process.env.NODE_ENV === 'production'

const logger = {
  debug: (message, ...args) => {
    if (!isProduction) {
      console.log(`[DEBUG] ${message}`, ...args)
    }
  },

  info: (message, ...args) => {
    if (!isProduction) {
      console.info(`[INFO] ${message}`, ...args)
    }
  },

  warn: (message, ...args) => {
    if (!isProduction) {
      console.warn(`[WARN] ${message}`, ...args)
    }
  },

  error: (message, ...args) => {
    // Always log errors, even in production
    console.error(`[ERROR] ${message}`, ...args)
  },

  // For critical logs that should always appear
  critical: (message, ...args) => {
    console.error(`[CRITICAL] ${message}`, ...args)
  },
}

export default logger
