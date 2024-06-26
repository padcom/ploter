#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { program } from 'commander'

import pkg from './package.json' with { type: 'json' }

import { opts } from './globals.mjs'
import { initSerialPort } from './serial.mjs'
import { initUserInput } from './user.mjs'
import { initGrbl } from './grbl.mjs'
import { initSystem } from './system.mjs'
import { loadSettings } from './settings.mjs'

program
  .name(`npx ${pkg.name}@latest`)
  .version(pkg.version)
  .description(pkg.description)
  .addHelpText('after', '\nHint: use the :help command in terminal for more\n')
  .argument('<port>', 'GRBL serial port to connect to')
  .option('-q, --quiet', 'limit output')
  .option('-b, --baud <speed>', 'baud rate', 115200)
  .action(main)
  .parse(process.argv)


function main(path, options) {
  opts.quiet = options.quiet
  const port = initSerialPort(path, options.baud)
  const user = initUserInput(port)
  initGrbl(port, user)
  initSystem(port)
}
