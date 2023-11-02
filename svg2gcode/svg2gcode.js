#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import { parse } from 'svg-parser'
import pkg from './package.json' assert { type: 'json' }

/**
 * @param {String} source
 */
function parsePath(source) {
  const items = source.split(' ')
  const result = []
  let entry = {}
  for (let i = 0; i < items.length; i++) {
    if (/[a-zA-Z]/.test(items[i])) {
      const command = items[i]
      entry = { command }
      result.push(entry)
    } else if (!entry.x) {
      entry.x = parseFloat(items[i])
    } else {
      entry.y = parseFloat(items[i])
    }
  }

  return result
}

function convertPathCommandsToGCode(path) {
  const result = []
  let command = ''
  for (let i = 0; i < path.length; i++) {
    const x = Math.round(path[i].x * 100) / 100
    const y = Math.round(path[i].y * 100) / 100
    // if (command !== path[i].command) {
    //   command = path[i].command
    //   if (path[i].command === 'M') {
    //     result.push('M3 S0            ; turn off laser')
    //   } else if (path[i].command === 'L') {
    //     result.push('M3 S1000         ; turn on laser')
    //   }
    // }

    if (path[i].command === 'M') {
      result.push(`G0 X${x} Y${y}`)
    } else if (path[i].command === 'L') {
      result.push(`G1 X${x} Y${y}`)
    }
  }

  return result.join('\n')
}

const file = 'example.svg'
const content = await readFile(file)
const source = content.toString()
const parsed = parse(source)
const svg = parsed.children.find(item => item.type === 'element' && item.tagName === 'svg')
if (!svg) throw new Error('No svg root found')
const viewBox = svg.properties.viewBox || '0 0 210 297'
const [ minX, minY, width, height ] = viewBox.split(' ').map(x => parseFloat(x))
const paths = svg.children
  .filter(item => item.type === 'element' && item.tagName === 'path')
  .map(path => path.properties.d)
  .filter(path => path)
  .map(path => parsePath(path))
  .map(path => path.map(({ command, x, y }) => ({
    command,
    x: x ? x - minX : undefined,
    y: y ? y - minY : undefined
  })))
  .map(path => convertPathCommandsToGCode(path))

console.log(`; ${pkg.name} version ${pkg.version} by ${pkg.author}.`)
console.log('')
console.log('; Initialize laser')
console.log('$H;              ; home')
console.log('G10 P0 L20 X0 Y0 ; reset plane to home position')
console.log('M3 S0;           ; turn laser off')
console.log('G21              ; millimeters')
console.log('G90              ; absolute coordinate')
console.log('G17              ; XY plane')
console.log('G94              ; units per minute feed rate mode')
console.log('G0 F6000         ; feed rate for moves (mm/min)')
console.log('G1 F100          ; feed rate for cuts (mm/min)')
console.log('M3 S64           ; laser power (1-255)')


console.log('')
console.log('; Start cutting (repeat pattern 2x)')
for (let i = 0; i < 2; i++) paths.forEach(path => console.log(path))
console.log('M3 S0            ; turn laser off')
