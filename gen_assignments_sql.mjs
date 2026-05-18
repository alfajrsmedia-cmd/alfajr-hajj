import { readFileSync, writeFileSync } from 'fs'

const data = JSON.parse(readFileSync('rooms_parsed.json', 'utf8'))

function esc(s) { return s ? s.replace(/'/g, "''") : '' }

const values = data.map(r =>
  `  ('${esc(r.full_name)}', ${r.group_number || 'NULL'}, '${r.room_number}')`
).join(',\n')

const sql = `
WITH pilgrim_room (full_name, group_number, room_number) AS (
  VALUES
${values}
)
INSERT INTO housing_assignments (pilgrim_id, room_id, is_current)
SELECT DISTINCT ON (p.id) p.id, r.id, true
FROM pilgrim_room pr
JOIN pilgrims p ON p.full_name = pr.full_name
JOIN groups g ON g.id = p.group_id AND g.group_number = pr.group_number
JOIN rooms r ON r.room_number = pr.room_number
ON CONFLICT DO NOTHING;
`

writeFileSync('C:\\Users\\alfaj\\alfajr-hajj\\insert_assignments.sql', sql, 'utf8')
console.log('SQL length:', sql.length, 'chars')
console.log('Rows:', data.length)
