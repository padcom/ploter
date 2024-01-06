#!/usr/bin/env node

import Jimp from 'jimp'

const gcode = [
  '; Initialize laser',
  'G10 P0 L20 X0 Y0 ; reset plane to current position',
  'M3 S0;           ; turn laser off',
  'G21              ; millimeters',
  'G90              ; absolute coordinate',
  'G17              ; XY plane',
  'G94              ; units per minute feed rate mode',
  'G0 F6000         ; feed rate for moves (mm/min)',
  'G1 F100          ; feed rate for cuts (mm/min)',
  'M3 S1            ; laser power (1-255)',
]

gcode.push('G0 X0 Y0')

// const frac = n => n - Math.floor(n)

for (let y = 0; y < 150; y++) {
  gcode.push(`G0 X0 Y${y} S0`)

  for (let x = 0; x < 40; x += 1) {
    const brightness = x % 2 === 0 ? 25 + x * 10 : 1
    gcode.push(`G1 X${x} F${25 + y * 5} S${brightness} \t ; brightness ${brightness}`)
  }
}

gcode.push('G0 X0')
gcode.push('M3 S0            ; laser off')

gcode.forEach(line => console.log(line))
