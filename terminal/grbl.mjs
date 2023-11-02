import { ReadlineParser } from 'serialport'
import { buffer, sendOneBufferLine, status } from './globals.mjs'

/**
 * @param {import("serialport").SerialPort} port
 * @param {import("readline").Interface} user
 */
export function initGrbl(port, user) {
  const grbl = port.pipe(new ReadlineParser())

  // Print all incoming data
  grbl.on('data', console.log)

  // Process GRBL responses
  grbl.on('data', response => {
    if (response.trim() === `Grbl 1.1g ['$' for help]`) {
      status.initialized = true
    } else if (status.initialized) {
      // When GRBL responds with `ok` we are ready to process the next command
      if (response.trim() === `ok` && buffer.length > 0) {
        sendOneBufferLine(port)
      }
      // Ready for interactive mode
      status.ready = true
      user.prompt()
    }
  })

  return grbl
}

export function command(port, cmd) {
  port.write(`${cmd}\n`)
  status.ready = false
}

/**
 * @param {import("serialport").SerialPort} port
 */
export function reset(port) {
  command(port, '\x18')
}

/**
 * @param {import("serialport").SerialPort} port
 */
export function unlock(port) {
  command(port, '$X')
}
