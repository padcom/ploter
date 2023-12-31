import readline from 'node:readline'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { buffer, status, opts } from './globals.mjs'
import { command, reset } from './grbl.mjs'

function printHelp() {
  console.log('\n* Available commands:')
  console.log('  :help           - show this help')
  console.log('  :quit, :exit    - exit')
  console.log('  :reset          - soft reset GRBL')
  console.log('  :unlock              - same as $X')
  console.log('  :exec filename       - load gcode from file and execute')
  console.log('  :laser on|off|power  - enable/disable laser (def. power: 1; disable: 0; power in range 0-1000)')
  console.log('  $$                   - show settings')
  console.log('  $#                   - view gcode parameter')
  console.log('  $G                   - displays the active gcode modes in the GRBL parser')
  console.log('  $I                   - show build info')
  console.log('  $N                   - view startup blocks')
  console.log('  $N0=line             - save first startup block')
  console.log('  $N1=line             - save second startup block')
  console.log('  $C                   - check gcode mode')
  console.log('  $X                   - kill alarm lock')
  console.log('  $H                   - home axes')
  console.log('  !                    - feed hold')
  console.log('  ?                    - current status')
}

/**
 * @param {String} filename
 */
function loadProgram(filename) {
  if (!filename.trim()) {
    console.log('! No filename specified')
    return []
  }
  if (!existsSync(filename)) {
    console.log(`! File ${filename} not found`)
    return []
  }
  if (!opts.quiet) console.log(`* Reading gcode from ${filename}`)
  const program = readFileSync(filename).toString().split('\n')

  if (!opts.quiet) console.log(`* Read number of lines: ${program.length}`)

  return program
}

/**
 * @param {import("serialport").SerialPort} port
 * @param {String[]} program
 */
function executeProgram(port, program) {
  if (program.length === 0) return
  if (!opts.quiet) console.log('* Executing program')
  buffer.push(...program)
  const first = buffer.shift()
  if (first) command(port, first)
}

const HISTORY_FILENAME = `${process.env.HOME}/.grbl-terminal_history`

function readUserHistory() {
  if (existsSync(HISTORY_FILENAME))
    return readFileSync(HISTORY_FILENAME).toString().split('\n')
  else
    return []
}

const USER_COMMANDS = [
  {
    detect: line => line.startsWith(':help'),
    execute: printHelp,
  },
  {
    detect: line => [':quit', ':exit'].includes(line.toLowerCase()),
    execute: (line, port) => {
      if (!opts.quiet) console.log('* Received quit command')
      port.close()
    },
  },
  {
    detect: line => line.startsWith(':reset'),
    execute: (line, port) => {
      if (!opts.quiet) console.log('* Resetting')
      reset(port)

      return true
    },
  },
  {
    detect: line => line.startsWith(':unlock'),
    execute: (line, port) => {
      if (!opts.quiet) console.log('* Unlocking')
      unlock(port)

      return true
    },
  },
  {
    detect: line => line.startsWith(':exec '),
    execute: (line, port) => {
      if (status.initialized && status.ready) {
        const filename = line.split(' ').at(-1)
        const program = loadProgram(filename)
        executeProgram(port, program)
      } else {
        console.error('! Not initialized or not ready to process commands - skipping')
      }
    },
  },
  {
    detect: line => line.startsWith(':laser'),
    execute: (line, port) => {
      const input = line.split(' ').at(-1)
      const power = input === 'on' ? '1' : input === 'off' ? 0 : input
      command(port, `G1 S${power} F100`)
    },
  },
  {
    // Detect unknown internal commands - all known are above this one
    detect: line => line.startsWith(':'),
    execute: line => {
      console.log('! Unknown command', line)
    },
  },
  {
    detect: line => ['$x', '$h'].includes(line.toLowerCase()),
    execute: (line, port) => {
      // On user input pause input stream until GRBL responds and send the command
      command(port, line)

      return true
    },
  },
  {
    detect: () => status.initialized && status.ready,
    execute: (line, port) => {
      // On user input pause input stream until GRBL responds and send the command
      command(port, line)

      return true
    },
  },
  {
    detect: () => true,
    execute: line => {
      if (!process.stdin.isTTY) {
        // Since the system is not yet initialized we will buffer user inputs
        // to be executed once it is
        buffer.push(line)
      } else if (!status.initialized) {
        console.log('! GRBL not initialized')
      } else if (!status.ready) {
        console.log('! GRBL busy')
      }
    },
  }
]

/**
 * @param {import("serialport").SerialPort} port
 */
export function initUserInput(port) {
  const input = process.stdin
  const output = input.isTTY ? process.stdout : null
  const user = readline.createInterface({
    input,
    output,
    history: readUserHistory(),
    removeHistoryDuplicates: true,
  })

  user.on('history', history => {
    writeFileSync(HISTORY_FILENAME, history.join('\n'))
  })

  // Predefined user commands
  // Process user commands
  user.on('line', line => {
    for (const command of USER_COMMANDS) {
      if (command.detect(line)) {
        if (!command.execute(line, port)) user.prompt()
        break
      }
    }
  })

  // When the input stream closes (e.g. ctrl+d) close the port
  user.on('close', () => {
    if (!opts.quiet) console.log('\n* End of user input detected')
    port.close()
  })

  return user
}
