import { command } from './grbl.mjs'

export const opts = {
  quiet: false,
}

export const status = {
  initialized: false,
  ready: false,
}

export const buffer = [
]

/**
 * @param {import("serialport").SerialPort} port
 */
export function sendOneBufferLine(port, prefix = '') {
  // The buffer is not empty - start sending commands
  const line = buffer.shift()
  if (!process.isTTY) console.log(prefix + line)
  command(port, line)
}
