const fs = require('fs');

const SUPABASE_URL = 'https://gnsdsisqsltxoujfslvf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Jkx9OWee5RXdeu-uTtw4kg_RsUnPNkF';

function normalize(name) {
  return (name || '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ةه]/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim();
}

async function api(path, method = 'GET', body = null) {
  const opts = {
    method,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': method === 'POST' ? 'return=minimal' : undefined,
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, opts);
  if (method === 'GET') return res.json();
  return res;
}

async function main() {
  const housingData = JSON.parse(fs.readFileSync('housing_data.json', 'utf8'));

  // 1. Fetch all rooms: room_number -> room_id
  const roomsRaw = await api('rooms?select=id,room_number&limit=1000');
  const roomMap = new Map(roomsRaw.map(r => [r.room_number, r.id]));
  console.log(`Rooms in DB: ${roomMap.size}`);

  // 2. Fetch all pilgrims: normalized name -> pilgrim_id
  const pilgrimsRaw = await api('pilgrims?select=id,full_name&limit=2000');
  const pilgrimMap = new Map(pilgrimsRaw.map(p => [normalize(p.full_name), p.id]));
  console.log(`Pilgrims in DB: ${pilgrimMap.size}`);

  // 3. Match rooms and pilgrims
  const assignments = [];
  const notFoundRooms = [];
  const notFoundPilgrims = [];

  for (const room of housingData) {
    const roomId = roomMap.get(room.roomNumber);
    if (!roomId) {
      notFoundRooms.push(room.roomNumber);
      continue;
    }
    for (const pilgrim of room.pilgrims) {
      const key = normalize(pilgrim.name);
      const pilgrimId = pilgrimMap.get(key);
      if (!pilgrimId) {
        notFoundPilgrims.push({ name: pilgrim.name, room: room.roomNumber });
      } else {
        assignments.push({
          pilgrim_id: pilgrimId,
          room_id: roomId,
          is_current: true,
          assigned_by: 'xps_import_2026',
        });
      }
    }
  }

  console.log(`\nMatched assignments: ${assignments.length}`);
  console.log(`Rooms not found: ${notFoundRooms.length}`, notFoundRooms);
  console.log(`Pilgrims not found: ${notFoundPilgrims.length}`);
  if (notFoundPilgrims.length > 0) {
    console.log('Not found pilgrims (first 20):');
    notFoundPilgrims.slice(0, 20).forEach(p => console.log(`  [غرفة ${p.room}] ${p.name}`));
  }

  // 4. Ask before deleting
  console.log('\n⚠️  About to DELETE all current housing_assignments and INSERT new ones.');
  console.log(`New assignments to insert: ${assignments.length}`);

  // 5. Delete all existing housing_assignments
  console.log('\nDeleting old assignments...');
  const delRes = await api('housing_assignments?id=gte.0', 'DELETE');
  console.log(`Delete status: ${delRes.status}`);

  // 6. Insert new assignments in batches of 200
  const BATCH = 200;
  let inserted = 0;
  for (let i = 0; i < assignments.length; i += BATCH) {
    const batch = assignments.slice(i, i + BATCH);
    const res = await api('housing_assignments', 'POST', batch);
    if (res.ok) {
      inserted += batch.length;
    } else {
      const txt = await res.text();
      console.error(`Insert error batch ${i}: ${txt.slice(0, 200)}`);
    }
    process.stdout.write(`\rInserted: ${inserted}/${assignments.length}`);
  }
  console.log(`\n\n✅ Done! Inserted: ${inserted} housing assignments`);
}

main().catch(console.error);
