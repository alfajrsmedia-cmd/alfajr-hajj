import { readFileSync, writeFileSync } from 'fs'

const data = JSON.parse(readFileSync('floors_parsed.json', 'utf8'))

// floor_number → floor_id (floors 1-6 have id 1-6)
const floorIdMap = { 1:1, 2:2, 3:3, 4:4, 5:5, 6:6 }

// Build unique rooms per floor
const roomMap = new Map() // "room_number" → floor_id
for (const row of data) {
  if (!roomMap.has(row.room_number)) {
    roomMap.set(row.room_number, floorIdMap[row.floor_number])
  }
}

// Generate rooms INSERT
const roomValues = [...roomMap.entries()]
  .sort((a,b) => parseInt(a[0]) - parseInt(b[0]))
  .map(([rn, fid]) => `(${fid},'${rn}',true)`)
  .join(',')

const roomsSql = `INSERT INTO rooms (floor_id, room_number, is_active) VALUES ${roomValues} RETURNING id, room_number;`
writeFileSync('new_rooms.sql', roomsSql, 'utf8')
console.log('Rooms SQL generated:', roomMap.size, 'rooms')

// Generate assignments SQL (CTE approach)
function esc(s) { return s ? s.replace(/'/g, "''") : '' }

const values = data.map(r =>
  `('${esc(r.full_name)}',${r.group_number || 'NULL'},'${r.room_number}')`
).join(',\n')

const assignSql = `WITH pr (full_name, group_number, room_number) AS (VALUES\n${values}\n)
INSERT INTO housing_assignments (pilgrim_id, room_id, is_current)
SELECT DISTINCT ON (p.id) p.id, r.id, true
FROM pr
JOIN pilgrims p ON p.full_name = pr.full_name
JOIN groups g ON g.id = p.group_id AND g.group_number = pr.group_number::int
JOIN rooms r ON r.room_number = pr.room_number
ON CONFLICT DO NOTHING;`

writeFileSync('new_assignments.sql', assignSql, 'utf8')
console.log('Assignments SQL generated:', data.length, 'rows')
console.log('Assignments SQL size:', assignSql.length, 'chars')
