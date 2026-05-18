import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const PAGES_DIR = 'C:\\Users\\alfaj\\Downloads\\rooms_xps_extract\\Documents\\1\\Pages'

function assignCol(x) {
  if (x >= 515 && x < 555) return 'name'
  if (x >= 20 && x < 140) return 'room'
  return null
}

const pageFiles = readdirSync(PAGES_DIR)
  .filter(f => f.match(/^\d+\.fpage$/))
  .sort((a, b) => parseInt(a) - parseInt(b))

let total = 0
for (const pf of pageFiles) {
  const xml = readFileSync(join(PAGES_DIR, pf), 'utf16le')
  const pattern = /<Glyphs\s[^>]+>/gs
  let m
  const rows = new Map()
  while ((m = pattern.exec(xml)) !== null) {
    const el = m[0]
    const textM = el.match(/UnicodeString="([^"]*)"/)
    const xM = el.match(/OriginX="([^"]+)"/)
    const yM = el.match(/OriginY="([^"]+)"/)
    if (!textM || !xM || !yM) continue
    const text = textM[1].trim()
    const x = parseFloat(xM[1])
    const y = parseFloat(yM[1])
    if (!text) continue
    const col = assignCol(x)
    if (col !== 'name') continue
    if (text === 'اسم الحاج') continue
    const ry = Math.round(y / 1.5) * 1.5
    rows.set(ry, text)
  }
  console.log(`Page ${pf.replace('.fpage','')}: ${rows.size} pilgrims`)
  total += rows.size
}
console.log('Total:', total)
