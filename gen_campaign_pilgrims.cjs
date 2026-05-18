const XLSX = require('./node_modules/xlsx');
const fs = require('fs');

const wb = XLSX.readFile('C:/Users/alfaj/Downloads/كشف التسكين بالحملة (2).xlsx');
const ws = wb.Sheets['Query17'];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 }).slice(1);

console.log('Total rows:', data.length);
console.log('Sample row:', data[0]);

// columns: 0=الحملة, 1=رقم المرجعي, 2=رقم الهوية, 3=رقم الجواز, 4=اسم الحاج, 5=نوع الحجز
const rows = data.filter(r => r[0] && r[4]);

let values = [];
rows.forEach(r => {
  const campaign = String(r[0] || '').trim();
  const ref_number = r[1] ? parseInt(r[1]) : 'NULL';
  const national_id = String(r[2] || '').trim().replace(/'/g, "''");
  const passport = String(r[3] || '').trim().replace(/'/g, "''");
  const name = String(r[4] || '').trim().replace(/'/g, "''");
  const booking_type = String(r[5] || '').trim().replace(/'/g, "''");

  values.push(`('${campaign}', ${ref_number === 'NULL' ? 'NULL' : ref_number}, '${national_id}', '${passport}', '${name}', '${booking_type}')`);
});

const sql = `INSERT INTO campaign_pilgrims (campaign, ref_number, national_id, passport_number, full_name, booking_type)
VALUES
${values.join(',\n')}
ON CONFLICT DO NOTHING;`;

fs.writeFileSync('C:/Users/alfaj/alfajr-hajj/insert_campaign_pilgrims.sql', sql);
console.log('Done. Rows:', values.length);

// stats per campaign
const stats = {};
rows.forEach(r => { const c = String(r[0]||'').trim(); stats[c] = (stats[c]||0)+1; });
console.log('Stats:', stats);
