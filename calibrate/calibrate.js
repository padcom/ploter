#!/usr/bin/env node


const gcode = [
  '$H;               ; home',
  'M3 S0;            ; turn laser off',
  'G10 P0 L20 X0 Y0  ; reset plane to home position',
  'G21               ; millimeters',
  'G90               ; absolute coordinate',
  'G17               ; XY plane',
  'G94               ; units per minute feed rate mode',
  'G0 F1000          ; feed rate for moves (mm/min)',
  'G1 F100           ; feed rate for cuts (mm/min)',
  'M3 S64            ; laser power (1-255)',
  '',
]
let index = 0

function pattern(y, step) {
  gcode.push(`G0 X1 Y${y}`)
  for (let power = 64; power < 256; power += step) {
    gcode.push(`G1 X10 S${power}`)
    gcode.push(`G1 X0 S${power}`)
  }
}

for (let step = 1; step < 10; step++) {
  pattern((step - 1) * 10, step)
}

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
