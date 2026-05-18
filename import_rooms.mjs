import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabase = createClient(
  'https://gnsdsisqsltxoujfslvf.supabase.co',
  'sb_publishable_Jkx9OWee5RXdeu-uTtw4kg_RsUnPNkF'
)

const data = JSON.parse(readFileSync('rooms_parsed.json', 'utf8'))

// Floor name → floor number mapping
function floorNum(name) {
  if (name.includes('الاول') || name.includes('الأول')) return 1
  if (name.includes('الثانى') || name.includes('الثاني')) return 2
  if (name.includes('الثالث')) return 3
  if (name.includes('الرابع')) return 4
  if (name.includes('الخامس') || name.includes('خامس')) return 5
  if (name.includes('السادس')) return 6
  return 0
}

// Fix floor name typo: "الطارق الخامس" → "الطابق الخامس"
function fixFloorName(name) {
  return name.replace('الطارق الخامس', 'الطابق الخامس').replace(' فجر الامارات', '').trim()
}

// ── 1. Insert hotel ──────────────────────────────────────────
const { data: hotelData, error: hErr } = await supabase
  .from('hotels')
  .insert({ name: 'فندق فجر الامارات', city: 'مكة المكرمة' })
  .select('id')
  .single()

if (hErr) { console.error('Hotel error:', hErr.message); process.exit(1) }
const hotelId = hotelData.id
console.log('✅ Hotel inserted, id:', hotelId)

// ── 2. Insert floors ─────────────────────────────────────────
const rawFloors = [...new Set(data.map(r => r.floor).filter(Boolean))]
const floorInserts = rawFloors.map(f => ({
  hotel_id: hotelId,
  floor_number: floorNum(f),
  floor_name: fixFloorName(f)
})).sort((a, b) => a.floor_number - b.floor_number)

const { data: floorsData, error: fErr } = await supabase
  .from('floors')
  .insert(floorInserts)
  .select('id, floor_number, floor_name')

if (fErr) { console.error('Floors error:', fErr.message); process.exit(1) }
console.log('✅ Floors inserted:', floorsData.length)
floorsData.forEach(f => console.log(`   Floor ${f.floor_number}: ${f.floor_name} (id=${f.id})`))

// Floor name → floor id map
const floorMap = {}
for (const f of floorsData) floorMap[f.floor_number] = f.id

// ── 3. Insert rooms ──────────────────────────────────────────
// Map each unique room → its floor
const roomToFloor = {}
for (const row of data) {
  if (row.room_number && row.floor) {
    const fn = floorNum(row.floor)
    roomToFloor[row.room_number] = fn
  }
}

const roomInserts = Object.entries(roomToFloor).map(([roomNum, fn]) => ({
  floor_id: floorMap[fn],
  room_number: roomNum,
  is_active: true
}))

const { data: roomsData, error: rErr } = await supabase
  .from('rooms')
  .insert(roomInserts)
  .select('id, room_number')

if (rErr) { console.error('Rooms error:', rErr.message); process.exit(1) }
console.log('✅ Rooms inserted:', roomsData.length)

// Room number → room id map
const roomMap = {}
for (const r of roomsData) roomMap[r.room_number] = r.id

// ── 4. Load pilgrims for matching ───────────────────────────
const { data: pilgrims } = await supabase
  .from('pilgrims')
  .select('id, full_name, group_id')

const { data: groups } = await supabase
  .from('groups')
  .select('id, group_number')

const groupNumToId = {}
for (const g of groups) groupNumToId[g.group_number] = g.id

// Build name+group → pilgrim_id index
const pilgrimIndex = {}
for (const p of pilgrims) {
  const key = p.full_name.trim()
  if (!pilgrimIndex[key]) pilgrimIndex[key] = []
  pilgrimIndex[key].push(p)
}

// ── 5. Build housing assignments ────────────────────────────
const assignments = []
const notFound = []

for (const row of data) {
  const roomId = roomMap[row.room_number]
  if (!roomId) { notFound.push({ reason: 'no room', ...row }); continue }

  const matches = pilgrimIndex[row.full_name] || []
  let pilgrim = null

  if (matches.length === 1) {
    pilgrim = matches[0]
  } else if (matches.length > 1 && row.group_number) {
    const groupId = groupNumToId[row.group_number]
    pilgrim = matches.find(p => p.group_id === groupId) || matches[0]
  }

  if (!pilgrim) { notFound.push({ reason: 'no match', ...row }); continue }

  assignments.push({
    pilgrim_id: pilgrim.id,
    room_id: roomId,
    is_current: true
  })
}

console.log(`\n✅ Assignments to insert: ${assignments.length}`)
console.log(`⚠️  Not matched: ${notFound.length}`)
if (notFound.length > 0) {
  console.log('Not found (first 10):')
  notFound.slice(0, 10).forEach(r => console.log(' ', JSON.stringify(r)))
}

// ── 6. Insert housing_assignments in batches ─────────────────
const BATCH = 100
let inserted = 0
for (let i = 0; i < assignments.length; i += BATCH) {
  const batch = assignments.slice(i, i + BATCH)
  const { error } = await supabase.from('housing_assignments').insert(batch)
  if (error) { console.error('Assignment insert error:', error.message); process.exit(1) }
  inserted += batch.length
  console.log(`Inserted assignments: ${inserted}/${assignments.length}`)
}

console.log('\n🎉 Done! Housing assignments complete.')
