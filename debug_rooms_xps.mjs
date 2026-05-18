import { readFileSync } from 'fs'

const xml = readFileSync('C:\\Users\\alfaj\\Downloads\\rooms_xps_extract\\Documents\\1\\Pages\\1.fpage', 'utf16le')

const pattern = /<Glyphs\s[^>]+>/gs
let m
const items = []
while ((m = pattern.exec(xml)) !== null) {
  const el = m[0]
  const textM = el.match(/UnicodeString="([^"]*)"/)
  const xM = el.match(/OriginX="([^"]+)"/)
  const yM = el.match(/OriginY="([^"]+)"/)
  if (textM && xM && yM) {
    const text = textM[1].trim()
    if (text) items.push({ y: parseFloat(yM[1]), x: parseFloat(xM[1]), text })
  }
}

// Show first 80 items sorted by Y then X desc (RTL)
items.sort((a, b) => a.y - b.y || b.x - a.x)
console.log('Total items page 1:', items.length)
items.slice(0, 80).forEach(i => console.log(`Y=${i.y.toFixed(1)} X=${i.x.toFixed(1)} "${i.text}"`))
