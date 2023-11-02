import { buffer, opts } from './globals.mjs'

/**
 * @param {import("serialport").SerialPort} port
 */
export function initSystem(port) {
  process.on('SIGINT', () => {
    if (buffer.length > 0) {
      if (!opts.quiet) console.log('\n* Execution interrupted')
      buffer.splice(0, buffer.length)
    } else {
      // When ctrl+c is pressed gracefully close the serial port
      if (!opts.quiet) console.log('\n* Forced termination')
      port.close()
    }
  })
}