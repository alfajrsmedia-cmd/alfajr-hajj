const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./mina_data.json', 'utf8'));

const SUPABASE_URL = 'https://gnsdsisqsltxoujfslvf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Jkx9OWee5RXdeu-uTtw4kg_RsUnPNkF';

console.log('Total rows:', data.length);

async function insertBatch(batch) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/mina_camps`, {
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
  for (let i = 0; i < data.length; i += BATCH) {
    const ok = await insertBatch(data.slice(i, i + BATCH));
    console.log(`Batch ${i}-${Math.min(i+BATCH, data.length)}: ${ok ? 'OK' : 'FAIL'}`);
  }
  console.log('Done!');
}

main();
