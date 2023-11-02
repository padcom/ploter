import { SerialPort } from 'serialport'
import { opts } from './globals.mjs'

export function initSerialPort(path, baudRate) {
  const port = new SerialPort({ path, baudRate, autoOpen: false })

  port.on('error', e => {
    // When an error occurs terminate the application
    console.error('!', e.message)
    process.exit(1)
  })

  port.on('close', () => {
    // When the port is closed exit the application
    if (!opts.quiet) console.log('* Session closed')
    process.exit(0)
  })

  port.open(err => {
    if (err) {
      console.error(err.message)
      process.exit(1)
    } else {
      if (!opts.quiet) console.log('Connected to', port.path, 'at', port.baudRate)
      if (process.stdin.isTTY && !opts.quiet) {
        console.log('Press ctrl+d to end input stream and close the terminal')
      }

      // When connected soft-reset GRBL
      port.write('\x18\n')
    }
  })

  return port
}
