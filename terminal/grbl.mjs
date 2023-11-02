import { ReadlineParser } from 'serialport'
import { buffer, status } from './globals.mjs'

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
    }

    if (status.initialized && response.trim() === `ok`) {
      // When GRBL responds with `ok` we are ready to process the next command
      if (buffer.length > 0) {
        // The buffer is not empty - start sending commands
        const line = buffer.shift()
        if (!process.isTTY) console.log(line)
        port.write(line + '\n')
      } else {
        // Ready for interactive mode
        ready = true
        user.prompt()
      }
    } else {
      ready = true
      user.prompt()
    }
  })

  return grbl
}

/**
 * @param {import("serialport").SerialPort} port
 */
export function reset(port) {
  port.write('\x18\n')
}

/**
 * @param {import("serialport").SerialPort} port
 */
export function unlock(port) {
  port.write('$X\n')
}
