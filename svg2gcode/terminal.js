#!/usr/bin/env node

import { SerialPort, ReadlineParser } from 'serialport'
import { stdin, stdout } from 'node:process'
import readline from 'node:readline'
import { readFileSync } from 'node:fs'

const input = process.stdin
const output = process.stdin.isTTY ? process.stdout : null

// Create user input interface (paused by default)
const user = readline.createInterface({ input, output, terminal: stdin.isTTY })
const port = new SerialPort({ path: '/home/padcom/dev/ttyGRBL0', baudRate: 115200, autoOpen: false,  })
const parser = port.pipe(new ReadlineParser())

process.on('SIGINT', () => {
  if (buffer.length > 0) {
    console.log('\n* Execution interrupted')
    buffer.splice(0, buffer.length)
  } else {
    // When ctrl+c is pressed gracefully close the serial port
    console.log('\n* Forced termination')
    port.close()
  }
})

port.on('error', e => {
  // When an error occurs terminate the application
  console.error('error:', e.message)
  process.exit(1)
})

port.on('close', () => {
  // When the port is closed exit the application
  console.log('* Session closed')
  process.exit(0)
})

port.open(err => {
  if (err) {
    console.error(err.message)
    process.exit(1)
  } else {
    console.log('Connected to', port.path, 'at', port.baudRate)
    if (stdin.isTTY) {
      console.log('Press ctrl+d to end input stream and close the terminal')
    }

    // When connected soft-reset GRBL
    port.write('\x18\n')
  }
})

// Print all incoming data
parser.on('data', console.log)

let initialized = false
let ready = false
const buffer = []

parser.on('data', response => {
  if (response.trim() === `Grbl 1.1g ['$' for help]`) {
    initialized = true
  }

  if (initialized && response.trim() === `ok`) {
    // When GRBL responds with `ok` we are ready to process the next command
    if (buffer.length > 0) {
      const line = buffer.shift()
      if (!process.isTTY) console.log(line)
      port.write(line + '\n')
    } else {
      ready = true
      user.prompt()
    }
  }
})

user.on('line', line => {
  if (line.startsWith(':exec ')) {
    const filename = line.split(' ').at(-1)
    console.log('* Reading gcode from', filename)
    const program = readFileSync(filename).toString().split('\n')
    console.log('* Read number of lines:', program.length)
    buffer.push(...program)
    console.log('* Executing')
    const first = buffer.shift()
    port.write(first + '\n')
  } else if (line.startsWith(':quit')) {
    console.log('* Exiting')
    port.close()
  } else if (line.startsWith(':reset')) {
    console.log('* Resetting')
    port.write('\x18\n')
  } else if (line.startsWith(':unlock')) {
    console.log('* Unlocking')
    port.write('$X\n')
  } else if (initialized && ready) {
    // On user input pause input stream until GRBL responds and send the command
    port.write(line + '\n')
    ready = false
  } else {
    buffer.push(line)
  }
})

user.on('close', () => {
  // When the input stream closes (e.g. ctrl+d) close the port
  console.log('\n* End of input stream detected')
  port.close()
})
