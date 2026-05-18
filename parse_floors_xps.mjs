import { readFileSync, readdirSync, writeFileSync } from 'fs'
import { join } from 'path'

const BASE = 'C:\\Users\\alfaj\\Downloads\\floors_extract'
const FLOORS = ['الاول','الثاني','الثالث','الرابع','الخامس','السادس']

const FLOOR_NUM = {
  'الاول': 1, 'الثاني': 2, 'الثالث': 3,
  'الرابع': 4, 'الخامس': 5, 'السادس': 6
}

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

function assignCol(x) {
  if (x >= 555) return 'group'
  if (x >= 515 && x < 555) return 'name'
  if (x >= 340 && x < 515) return 'hotel'
  if (x >= 140 && x < 340) return 'floor_txt'
  if (x >= 20 && x < 140) return 'room'
  return null
}

const allRows = []

for (const floorName of FLOORS) {
  const pagesDir = join(BASE, floorName, 'Documents', '1', 'Pages')
  const pageFiles = readdirSync(pagesDir)
    .filter(f => f.match(/^\d+\.fpage$/))
    .sort((a, b) => parseInt(a) - parseInt(b))

  let floorCount = 0
  for (const pf of pageFiles) {
    const xml = readFileSync(join(pagesDir, pf), 'utf16le')
    const items = extractGlyphs(xml)

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

      if (!cols.name || !cols.room) continue

      const name = cols.name.sort((a,b) => b.x - a.x).map(i => i.text).join(' ').trim()
      const room = cols.room.map(i => i.text).join('').trim()
      const group = cols.group ? cols.group.map(i => i.text).join('').trim() : ''
      const groupNum = parseInt(group)

      if (name === 'اسم الحاج' || !room || isNaN(parseInt(room))) continue

      allRows.push({
        group_number: isNaN(groupNum) ? null : groupNum,
        full_name: name,
        floor_number: FLOOR_NUM[floorName],
        room_number: room
      })
      floorCount++
    }
  }
  console.log(`الطابق ${floorName}: ${floorCount} حاج`)
}

console.log(`\nإجمالي: ${allRows.length} حاج`)

// Unique rooms
const newRooms = [...new Set(allRows.map(r => r.room_number))]
console.log('غرف مختلفة:', newRooms.length)

writeFileSync('C:\\Users\\alfaj\\alfajr-hajj\\floors_parsed.json', JSON.stringify(allRows, null, 2), 'utf8')
console.log('Saved to floors_parsed.json')
