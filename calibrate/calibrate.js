#!/usr/bin/env node


const gcode = [
//  '$H;               ; home',
  'M3 S0;            ; turn laser off',
  'G10 P0 L20 X0 Y0  ; reset plane to home position',
  'G21               ; millimeters',
  'G90               ; absolute coordinate',
  'G17               ; XY plane',
  'G94               ; units per minute feed rate mode',
  'G0 F1000          ; feed rate for moves (mm/min)',
  'G1 F900           ; feed rate for cuts (mm/min)',
  'M3 S1             ; laser power (0-1000)',
  '',
]

let index = 0

function line(x1, y1, x2, y2, step = 10) {
  gcode.push(`G0 X${x1} Y${y1}`)
  for (let power = 400; power <= 1000; power += step) {
    gcode.push(`G1 X${x2} Y${y2} S${power}`)
    gcode.push(`G1 X${x1} Y${y1}`)
    gcode.push(`G1 X${x2} Y${y2}`)
    gcode.push(`G1 X${x1} Y${y1}`)
  }
}

function box(x1, y1, x2, y2, step = 10) {
  gcode.push(`G0 X${x1} Y${y1}      \t\t; move to start of the box`)
  for (let power = 400; power <= 1000; power += step) {
    gcode.push(`G1 X${x2} Y${y1} S${power} \t\t; 1`)
    gcode.push(`G1 X${x2} Y${y2}           \t; 2`)
    gcode.push(`G1 X${x1} Y${y2}           \t; 3`)
    gcode.push(`G1 X${x1} Y${y1}           \t; 4`)
    gcode.push(`G1 X${x2} Y${y1}           \t; 1`)
    gcode.push(`G1 X${x2} Y${y2}           \t; 2`)
    gcode.push(`G1 X${x1} Y${y2}           \t; 3`)
    gcode.push(`G1 X${x1} Y${y1}           \t; 4`)
  }
}

line(0, 10, 20, 10)
//box(0, 0, 10, 10)

// const POWER_MAX           = 256
// const POWER_COUNT         = 256-64
// const POWER_INCREMENT     = POWER_MAX/POWER_COUNT
// const FEEDRATE_MAX        = 200
// const FEEDRATE_COUNT      = 4
// const FEEDRATE_INCREMENT  = FEEDRATE_MAX/FEEDRATE_COUNT
// const PASSCOUNT_MAX       = 50
// const PASSCOUNT_COUNT     = 5
// const PASSCOUNT_INCREMENT = PASSCOUNT_MAX/PASSCOUNT_COUNT

// for (let powerIndex = 0; powerIndex < POWER_COUNT; powerIndex++) {
//   const power = powerIndex * POWER_INCREMENT + POWER_INCREMENT
//   for (let feedrateIndex = 0; feedrateIndex < FEEDRATE_COUNT; feedrateIndex++) {
//     const feedrate = feedrateIndex * FEEDRATE_INCREMENT + FEEDRATE_INCREMENT
//     for (let passcountIndex = 0; passcountIndex < 5; passcountIndex++) {
//       const passcount = passcountIndex * PASSCOUNT_INCREMENT + PASSCOUNT_INCREMENT
//       const iteration = powerIndex * POWER_COUNT + feedrateIndex * FEEDRATE_COUNT + passcountIndex
//       gcode.push(`; index=${iteration}`)
//       gcode.push(`; passcount=${passcount} (${passcountIndex})`)
//       gcode.push(`M3 S${power}; power=${power} (${powerIndex})`)
//       gcode.push(`G1 F${feedrate}; feedrate=${feedrate} (${feedrateIndex})`)

//       const x0 = (iteration % 5) * 15, x1 = (iteration % 5) * 15 + 10
//       const y = iteration * 5
//       gcode.push(`G0 X${x0} Y${y}`)
//       for (let i = 0; i < passcount; i++) {
//         gcode.push(`G1 X${x1} Y${y}`)
//         gcode.push(`G1 X${x0} Y${y}`)
//       }
//       gcode.push('')
//     }
//   }
// }
gcode.push('')
gcode.push('; power off laser')
gcode.push('M3 S0')

gcode.forEach(command => { console.log(command) })
