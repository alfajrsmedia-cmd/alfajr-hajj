const fs = require('fs');

const SUPABASE_URL = 'https://gnsdsisqsltxoujfslvf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Jkx9OWee5RXdeu-uTtw4kg_RsUnPNkF';

function normalize(name) {
  return (name || '').replace(/[أإآ]/g, 'ا').replace(/[ةه]/g, 'ه').replace(/ى/g, 'ي').replace(/\s+/g, ' ').trim();
}

async function main() {
  const housing = JSON.parse(fs.readFileSync('housing_data.json', 'utf8'));

  const roomsRaw = await fetch(`${SUPABASE_URL}/rest/v1/rooms?select=id,room_number&limit=1000`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
  }).then(r => r.json());
  const roomMap = new Map(roomsRaw.map(r => [r.room_number, r.id]));

  const pilgrimsRaw = await fetch(`${SUPABASE_URL}/rest/v1/pilgrims?select=id,full_name&limit=2000`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
  }).then(r => r.json());
  const pilgrimMap = new Map(pilgrimsRaw.map(p => [normalize(p.full_name), p.id]));

  const assignments = [];
  for (const room of housing) {
    const roomId = roomMap.get(room.roomNumber);
    if (!roomId) { console.log('Room not found:', room.roomNumber); continue; }
    for (const p of room.pilgrims) {
      const pilgrimId = pilgrimMap.get(normalize(p.name));
      if (!pilgrimId) { console.log('Pilgrim not found:', p.name); continue; }
      assignments.push(`(${pilgrimId}, ${roomId}, true, 'xps_import_2026')`);
    }
  }

  console.log('Matched:', assignments.length);

  // Build batched SQL files
  const BATCH = 200;
  const sqls = [];
  for (let i = 0; i < assignments.length; i += BATCH) {
    const vals = assignments.slice(i, i + BATCH).join(',\n');
    sqls.push(`INSERT INTO housing_assignments (pilgrim_id, room_id, is_current, assigned_by) VALUES\n${vals};`);
  }

  fs.writeFileSync('insert_batches.json', JSON.stringify(sqls));
  console.log(`Saved ${sqls.length} SQL batches`);
}

main().catch(console.error);
