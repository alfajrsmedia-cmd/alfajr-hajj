import { readFileSync } from 'fs'

// Check page 2 for row numbers
const xml = readFileSync('C:\\Users\\alfaj\\Downloads\\xps_extract\\Documents\\1\\Pages\\2.fpage', 'utf16le')

const pattern = /<Glyphs\s[^>]+>/gs
let m
const items = []
while ((m = pattern.exec(xml)) !== null) {
  const el = m[0]
  const textM = el.match(/UnicodeString="([^"]*)"/)
  const xM = el.match(/OriginX="([^"]+)"/)
  const yM = el.match(/OriginY="([^"]+)"/)
  if (textM && xM && yM) {
    const y = parseFloat(yM[1])
    const x = parseFloat(xM[1])
    const text = textM[1].trim()
    if (text) items.push({ y, x, text })
  }
}

// Find all row numbers (at X>=560, numeric)
const rowNums = items.filter(i => i.x >= 560 && /^\d+$/.test(i.text)).sort((a, b) => a.y - b.y)
console.log('All row numbers on page 2:')
rowNums.forEach(r => console.log(`  Y=${r.y.toFixed(2)}: row ${r.text}`))

// Also find very first items sorted by Y
console.log('\nFirst 5 items by Y (all):')
items.sort((a,b) => a.y - b.y).slice(0, 5).forEach(i => console.log(`  Y=${i.y.toFixed(2)} X=${i.x.toFixed(2)} "${i.text}"`))

// Show items with Y < 200
const topItems = items.filter(i => i.y < 200).sort((a,b) => a.y - b.y)
console.log('\nItems with Y < 200:')
topItems.forEach(i => console.log(`  Y=${i.y.toFixed(2)} X=${i.x.toFixed(2)} "${i.text}"`))
