import { readFileSync } from 'fs'

const data = JSON.parse(readFileSync('rooms_parsed.json', 'utf8'))

// Floor name → floor_id (from what we just inserted)
function floorNum(name) {
  if (!name) return 0
  if (name.includes('الاول') || name.includes('الأول')) return 1
  if (name.includes('الثانى') || name.includes('الثاني')) return 2
  if (name.includes('الثالث')) return 3
  if (name.includes('الرابع')) return 4
  if (name.includes('الخامس') || name.includes('خامس')) return 5
  if (name.includes('السادس')) return 6
  return 0
}

// floor_number → floor_id
const floorIdMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 }

// Build unique rooms
const roomMap = {}
for (const row of data) {
  if (!row.room_number) continue
  const fn = floorNum(row.floor)
  if (!roomMap[row.room_number]) roomMap[row.room_number] = fn
}

const values = Object.entries(roomMap)
  .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
  .map(([rn, fn]) => `(${floorIdMap[fn] || 1}, '${rn}', true)`)
  .join(',\n')

console.log(`INSERT INTO rooms (floor_id, room_number, is_active) VALUES`)
console.log(values)
console.log(`RETURNING id, room_number, floor_id;`)
console.log('\n-- Total rooms:', Object.keys(roomMap).length)
