import { readFileSync, writeFileSync } from 'fs'

const data = JSON.parse(readFileSync('pilgrims_parsed.json', 'utf8'))

// Get unique group numbers
const groupNumbers = [...new Set(data.map(p => p.group_number))].sort((a, b) => a - b)

// Generate groups INSERT
const groupValues = groupNumbers.map(g => `(${g})`).join(',\n')
const groupsSql = `INSERT INTO groups (group_number) VALUES\n${groupValues}\nRETURNING id, group_number;`

writeFileSync('insert_groups.sql', groupsSql, 'utf8')
console.log('Generated insert_groups.sql with', groupNumbers.length, 'groups')

// Generate pilgrim inserts - will need group_id from groups
// We'll generate a CTE-based insert that looks up group_id
function escapeStr(s) {
  if (!s) return 'NULL'
  return `'${s.replace(/'/g, "''")}'`
}

function toDate(s) {
  if (!s || s.length < 8) return 'NULL'
  // Convert YYYY/MM/DD to YYYY-MM-DD
  return `'${s.replace(/\//g, '-')}'`
}

function natCode(s) {
  const map = {
    'الامارات': 'UAE',
    'عمان': 'Oman',
    'المغرب': 'Morocco',
    'سوريا': 'Syria',
    'موريتانيا': 'Mauritania'
  }
  return escapeStr(map[s] || s)
}

// Build pilgrim rows using a CTE to look up group_id
const pilgrimRows = data.map(p => {
  const name = escapeStr(p.full_name)
  const passport = escapeStr(p.passport_number)
  const nat = natCode(p.nationality)
  const birth = toDate(p.birth_date)
  const groupNum = p.group_number || 'NULL'
  return `  (${name}, ${passport}, ${nat}, ${birth}, ${groupNum})`
}).join(',\n')

const pilgrimsSql = `-- Insert pilgrims with group_id lookup
WITH group_map AS (
  SELECT id, group_number FROM groups
),
pilgrim_data (full_name, passport_number, nationality, birth_date, group_number) AS (
  VALUES
${pilgrimRows}
)
INSERT INTO pilgrims (full_name, passport_number, nationality, birth_date, group_id)
SELECT pd.full_name, pd.passport_number, pd.nationality, pd.birth_date::date, gm.id
FROM pilgrim_data pd
LEFT JOIN group_map gm ON gm.group_number = pd.group_number::int;`

writeFileSync('insert_pilgrims.sql', pilgrimsSql, 'utf8')
console.log('Generated insert_pilgrims.sql with', data.length, 'pilgrims')
