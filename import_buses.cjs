const XLSX = require('./node_modules/xlsx');
const fs = require('fs');

const wb = XLSX.readFile('C:/Users/alfaj/Downloads/قائمة الباصات.xlsx');
const ws = wb.Sheets['كل الباصات'];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 }).slice(1);

const SUPABASE_URL = 'https://gnsdsisqsltxoujfslvf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Jkx9OWee5RXdeu-uTtw4kg_RsUnPNkF';

const rows = data.filter(r => r[0] && r[2]).map(r => ({
  bus_number: parseInt(r[0]),
  group_number: r[1] ? parseInt(r[1]) : null,
  full_name: String(r[2] || '').trim(),
  campaign: 'الفجر'
}));

console.log('Total rows:', rows.length);
console.log('Sample:', rows[0]);

// Stats per bus
const stats = {};
rows.forEach(r => { stats[r.bus_number] = (stats[r.bus_number] || 0) + 1; });
console.log('Buses:', Object.keys(stats).length, '| Stats:', stats);

async function insertBatch(batch) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/bus_distribution`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(batch)
  });
  if (!res.ok) console.error('Error:', await res.text());
  return res.ok;
}

async function main() {
  const BATCH = 100;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const ok = await insertBatch(batch);
    console.log(`Batch ${i}-${i + batch.length}: ${ok ? 'OK' : 'FAIL'}`);
  }
  console.log('Done!');
}

main();
