import { command } from './grbl.mjs'

export const opts = {
  quiet: false,
}

export const status = {
  initialized: false,
  ready: false,
}

export const buffer = [
  '$I        ; dump build info',
  '$G        ; dump parser state',
  '??        ; dump settings',
  'G0 F1000  ; moving speed (1000mm/min)',
  'G1 F100   ; cutting/engraving speed (100mm/min)',
  'M3 S0     ; turn laser off'
]

/**
 * @param {import("serialport").SerialPort} port
 */
export function sendOneBufferLine(port) {
  // The buffer is not empty - start sending commands
  const line = buffer.shift()
  if (!process.isTTY) console.log(line)
  command(port, line)
}
