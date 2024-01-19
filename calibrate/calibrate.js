#!/usr/bin/env node


const gcode = [
//  '$H;               ; home',
  'M3 S1;            ; laser on',
  'G10 P0 L20 X0 Y0  ; reset plane to home position',
  'G21               ; millimeters',
  'G90               ; absolute coordinate',
  'G17               ; XY plane',
  'G94               ; units per minute feed rate mode',
  'G0 F1000          ; feed rate for moves (mm/min)',
  'G1 F1000          ; feed rate for cuts (mm/min)',
  '',
]

let index = 0

function line(x, y, length, step = 10, startPower = 15, endPower = 255) {
  const count = (endPower - startPower) / step
  for (let i = 0; i<= count; i++) {
    const power = startPower + step * i
    gcode.push(`G0 X${x + i * 2} Y${y}`)
    gcode.push(`G1 X${x + i * 2} Y${y + length} S${power} F1000`)
    gcode.push(`G1 X${x + i * 2 + 0.5} Y${y + length} S${power} F1000`)
    gcode.push(`G1 X${x + i * 2 + 0.5} Y${y} S${power} F1000`)
  }
}

function cut(x1, y1, x2, y2, power = 160, passes = 60, stepDown = 0.05) {
  gcode.push(`G0 X${x1} Y${y1}`)
  for (let i = 0; i < passes / 2; i++) {
    gcode.push(`G0 Z${-i * stepDown}`)
    gcode.push(`G1 X${x2} Y${y2} S${power} F1000`)
    gcode.push(`G1 X${x1} Y${y1} S${power} F1000`)
  }
}

line(0, 0, 50)
//cut(0, 0, 0, 50)

gcode.push('')
gcode.push('M5 S0             ; laser off')

gcode.forEach(command => { console.log(command) })
