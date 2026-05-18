const XLSX = require('./node_modules/xlsx');

const SUPABASE_URL = 'https://gnsdsisqsltxoujfslvf.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || require('fs').readFileSync('.env.local','utf8').match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim();

const wb = XLSX.readFile('C:/Users/alfaj/Downloads/كشف التسكين بالحملة (2).xlsx');
const ws = wb.Sheets['Query17'];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 }).slice(1);

const rows = data.filter(r => r[0] && r[4]).map(r => ({
  campaign: String(r[0]||'').trim(),
  ref_number: r[1] ? parseInt(r[1]) : null,
  national_id: String(r[2]||'').trim(),
  passport_number: String(r[3]||'').trim(),
  full_name: String(r[4]||'').trim(),
  booking_type: String(r[5]||'').trim(),
}));

async function insertBatch(batch) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/campaign_pilgrims`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(batch)
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('Error:', err);
  }
  return res.ok;
}

async function main() {
  console.log('Total rows:', rows.length);
  const BATCH = 100;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const ok = await insertBatch(batch);
    console.log(`Batch ${i}-${i+batch.length}: ${ok ? 'OK' : 'FAIL'}`);
  }
  console.log('Done!');
}

main();
