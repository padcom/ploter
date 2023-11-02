export const opts = {
  quiet: false,
}

export const status = {
  initialized: false,
  ready: false,
}

export const buffer = ['??', '$G', '$I']

/**
 * @param {import("serialport").SerialPort} port
 */
export function sendOneBufferLine(port) {
  // The buffer is not empty - start sending commands
  const line = buffer.shift()
  if (!process.isTTY) console.log(line)
  command(port, line)
}
