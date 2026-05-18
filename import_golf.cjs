const XLSX = require('./node_modules/xlsx');

const wb = XLSX.readFile('C:/Users/alfaj/Downloads/قائمة حجز عربات القولف.xlsx');
const sheets = ['القدوم رحلة 1','القدوم رحلة 2','القدوم التحاق','الافاضة','الوداع','العام'];

const SUPABASE_URL = 'https://gnsdsisqsltxoujfslvf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Jkx9OWee5RXdeu-uTtw4kg_RsUnPNkF';

// col: 0=م, 1=الاسم, 2=المجموعة, 3=الهوية, 4=الجواز, 5=الهاتف, 6=الخدمة, 7=السداد, 8=المبلغ, 9=البرنامج, 10=التاريخ
let allRows = [];
sheets.forEach(sheetName => {
  const ws = wb.Sheets[sheetName];
  if (!ws) return;
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 }).slice(1);
  const rows = data.filter(r => r[1]).map(r => ({
    full_name: String(r[1]).trim(),
    group_number: r[2] ? String(r[2]).trim() : null,
    national_id: r[3] ? String(r[3]).trim().replace(/[^0-9\-]/g,'') : null,
    passport_number: r[4] ? String(r[4]).trim() : null,
    phone: r[5] ? String(r[5]).trim() : null,
    payment_method: r[7] ? String(r[7]).trim() : null,
    amount_paid: r[8] ? parseFloat(String(r[8])) || null : null,
    program: r[9] ? String(r[9]).trim() : null,
    travel_date: r[10] ? String(r[10]).trim() : null,
    service_type: sheetName,
  }));
  console.log(`Sheet "${sheetName}": ${rows.length} rows`);
  allRows = allRows.concat(rows);
});

console.log('Total:', allRows.length);

async function insertBatch(batch) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/golf_cart_bookings`, {
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
  let ok = 0;
  for (let i = 0; i < allRows.length; i += BATCH) {
    const batch = allRows.slice(i, i + BATCH);
    const result = await insertBatch(batch);
    if (result) ok += batch.length;
    console.log(`Batch ${i}-${i + batch.length}: ${result ? 'OK' : 'FAIL'}`);
  }
  console.log(`Done! ${ok}/${allRows.length} inserted`);
}

main();
