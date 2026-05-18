import { readFileSync, readdirSync, writeFileSync } from 'fs'
import { join } from 'path'

const PAGES_DIR = 'C:\\Users\\alfaj\\Downloads\\rooms_xps_extract\\Documents\\1\\Pages'

function extractGlyphs(xml) {
  const items = []
  const pattern = /<Glyphs\s[^>]+>/gs
  let m
  while ((m = pattern.exec(xml)) !== null) {
    const el = m[0]
    const textM = el.match(/UnicodeString="([^"]*)"/)
    const xM = el.match(/OriginX="([^"]+)"/)
    const yM = el.match(/OriginY="([^"]+)"/)
    if (textM && xM && yM) {
      const text = textM[1].trim()
      if (text) items.push({ x: parseFloat(xM[1]), y: parseFloat(yM[1]), text })
    }
  }
  return items
}

function roundY(y) { return Math.round(y / 1.5) * 1.5 }

// Column assignment based on analysis:
// group_num ~568, name ~536, hotel ~370, room_floor ~161, room_num ~32
function assignCol(x) {
  if (x >= 555) return 'group'       // رقم المجموعة
  if (x >= 515 && x < 555) return 'name'   // اسم الحاج
  if (x >= 340 && x < 515) return 'hotel'  // السكن (hotel name)
  if (x >= 140 && x < 340) return 'floor'  // الطابق
  if (x >= 20 && x < 140) return 'room'    // رقم الغرفة
  return null
}

const allRows = []

const pageFiles = readdirSync(PAGES_DIR)
  .filter(f => f.match(/^\d+\.fpage$/))
  .sort((a, b) => parseInt(a) - parseInt(b))

for (const pageFile of pageFiles) {
  const xml = readFileSync(join(PAGES_DIR, pageFile), 'utf16le')
  const items = extractGlyphs(xml)

  // Group by rounded Y
  const rows = new Map()
  for (const item of items) {
    const ry = roundY(item.y)
    if (!rows.has(ry)) rows.set(ry, [])
    rows.get(ry).push(item)
  }

  for (const [ry, rowItems] of [...rows.entries()].sort((a,b) => a[0]-b[0])) {
    const cols = {}
    for (const item of rowItems) {
      const col = assignCol(item.x)
      if (!col) continue
      if (!cols[col]) cols[col] = []
      cols[col].push(item)
    }

    // Must have name and room to be a data row
    if (!cols.name || !cols.room) continue

    const name = cols.name.sort((a,b) => b.x - a.x).map(i => i.text).join(' ').trim()
    const group = cols.group ? cols.group.map(i => i.text).join('').trim() : ''
    const hotel = cols.hotel ? [...new Set(cols.hotel.map(i => i.text.trim()).filter(t => t && t !== '-' && !/^\d$/.test(t)))].join(' ').trim() : ''
    const floor = cols.floor ? cols.floor.sort((a,b) => a.x - b.x)
      .map(i => i.text.trim()).filter(t => t && t !== '-' && !/^\d$/.test(t)).join(' ').trim() : ''
    const room = cols.room.map(i => i.text).join('').trim()

    // Skip headers
    if (name === 'اسم الحاج' || !room || isNaN(parseInt(room))) continue
    if (name.includes('اسم') && name.includes('حاج')) continue

    const groupNum = parseInt(group)

    allRows.push({
      group_number: isNaN(groupNum) ? null : groupNum,
      full_name: name,
      hotel: hotel || 'فجر الامارات',
      floor: floor,
      room_number: room
    })
  }
}

console.log('Total housing rows:', allRows.length)
allRows.slice(0, 10).forEach(r => console.log(JSON.stringify(r)))
console.log('...')

// Unique hotels
const hotels = [...new Set(allRows.map(r => r.hotel).filter(Boolean))]
console.log('\nHotels:', hotels)

// Unique floors
const floors = [...new Set(allRows.map(r => r.floor).filter(Boolean))].sort()
console.log('\nFloors:', floors)

// Unique rooms
const rooms = [...new Set(allRows.map(r => r.room_number))].sort((a,b) => parseInt(a)-parseInt(b))
console.log('\nRoom numbers (first 20):', rooms.slice(0, 20))
console.log('Total unique rooms:', rooms.length)

writeFileSync('C:\\Users\\alfaj\\alfajr-hajj\\rooms_parsed.json', JSON.stringify(allRows, null, 2), 'utf8')
console.log('\nSaved to rooms_parsed.json')
