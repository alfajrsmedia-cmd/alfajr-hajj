import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const SUPABASE_URL = 'https://gnsdsisqsltxoujfslvf.supabase.co'
const SUPABASE_KEY = 'sb_publishable_Jkx9OWee5RXdeu-uTtw4kg_RsUnPNkF'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const data = JSON.parse(readFileSync('pilgrims_parsed.json', 'utf8'))

// Nationality mapping
const natMap = {
  'الامارات': 'UAE',
  'عمان': 'Oman',
  'المغرب': 'Morocco',
  'سوريا': 'Syria',
  'موريتانيا': 'Mauritania'
}

// 1. Get group_id mapping
const { data: groups, error: groupsErr } = await supabase.from('groups').select('id, group_number')
if (groupsErr) { console.error('Groups fetch error:', groupsErr); process.exit(1) }

const groupMap = {}
for (const g of groups) groupMap[g.group_number] = g.id
console.log(`Loaded ${groups.length} groups`)

// 2. Build pilgrim rows
const pilgrims = data.map(p => ({
  full_name: p.full_name,
  passport_number: p.passport_number || null,
  nationality: natMap[p.nationality] || p.nationality || null,
  birth_date: p.birth_date ? p.birth_date.replace(/\//g, '-') : null,
  group_id: p.group_number ? groupMap[p.group_number] || null : null
}))

// 3. Insert in batches of 100
const BATCH = 100
let inserted = 0
for (let i = 0; i < pilgrims.length; i += BATCH) {
  const batch = pilgrims.slice(i, i + BATCH)
  const { error } = await supabase.from('pilgrims').insert(batch)
  if (error) {
    console.error(`Error at batch ${i}-${i + BATCH}:`, error.message)
    process.exit(1)
  }
  inserted += batch.length
  console.log(`Inserted ${inserted}/${pilgrims.length}...`)
}

console.log(`\nDone! Inserted ${inserted} pilgrims.`)

// 4. Verify
const { count } = await supabase.from('pilgrims').select('*', { count: 'exact', head: true })
console.log(`Total pilgrims in DB: ${count}`)
