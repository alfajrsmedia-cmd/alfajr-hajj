const XLSX = require('./node_modules/xlsx');

const wb = XLSX.readFile('C:/Users/alfaj/Downloads/قائمة الباصات.xlsx');
const ws = wb.Sheets['كل الباصات'];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 }).slice(1);

const SUPABASE_URL = 'https://gnsdsisqsltxoujfslvf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Jkx9OWee5RXdeu-uTtw4kg_RsUnPNkF';

const rows = data.filter(r => r[2] && r[3]).map(r => ({
  name: String(r[2]).trim(),
  phone: String(r[3]).trim()
}));

console.log('Total rows with phone:', rows.length);
if (rows.length > 0) console.log('Sample:', rows[0]);

async function updatePhone(name, phone) {
  const encoded = encodeURIComponent(name);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/bus_distribution?full_name=eq.${encoded}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ phone })
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error(`Error for ${name}:`, txt);
    return false;
  }
  return true;
}

async function main() {
  let ok = 0, fail = 0;
  for (let i = 0; i < rows.length; i++) {
    const { name, phone } = rows[i];
    const result = await updatePhone(name, phone);
    if (result) ok++; else fail++;
    if ((i + 1) % 50 === 0) console.log(`Progress: ${i + 1}/${rows.length} (ok=${ok}, fail=${fail})`);
  }
  console.log(`Done! ok=${ok}, fail=${fail}`);
}

main();
