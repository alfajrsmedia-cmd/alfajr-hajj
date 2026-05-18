const XLSX = require('./node_modules/xlsx');

const wb = XLSX.readFile('C:/Users/alfaj/Downloads/توزيع الباصات بأسماء الحملة.xlsx');
const ws = wb.Sheets['HusWael'];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 }).slice(1);

const SUPABASE_URL = 'https://gnsdsisqsltxoujfslvf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Jkx9OWee5RXdeu-uTtw4kg_RsUnPNkF';

// columns: 0=الحملة, 1=رقم الباص, 2=رقم المرجعي, 3=رقم الهوية, 4=رقم الجواز, 5=رقم المجموعة, 6=اسم الحاج
const rows = data.filter(r => r[0] && r[6]).map(r => ({
  campaign: String(r[0]).trim(),
  bus_number: parseInt(r[1]),
  ref_number: r[2] ? parseInt(r[2]) : null,
  national_id: String(r[3] || '').trim() || null,
  passport_number: String(r[4] || '').trim() || null,
  group_number: r[5] ? parseInt(r[5]) : null,
  full_name: String(r[6]).trim(),
}));

console.log('Total:', rows.length);
const stats = {};
rows.forEach(r => { stats[r.campaign] = (stats[r.campaign]||0)+1; });
console.log('Stats:', stats);

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
    const ok = await insertBatch(rows.slice(i, i + BATCH));
    console.log(`Batch ${i}-${i + Math.min(BATCH, rows.length - i)}: ${ok ? 'OK' : 'FAIL'}`);
  }
  console.log('Done!');
}

main();
