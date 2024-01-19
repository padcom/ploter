#!/usr/bin/env node

console.log('G0 Z3')
console.log('G0 X0 Y0')

for (let x = 0; x <= 180; x += 45) {
  for (let y = 0; y < 300; y += 50) {
    console.log('G0 Z3')
    console.log(`G0 X${x} Y${y}`)
    console.log('G0 Z3')
    console.log('G1 Z1 F100')
  }
}

console.log('G0 Z3')
console.log('G0 X0 Y0')
