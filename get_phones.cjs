const XLSX = require('./node_modules/xlsx');
const fs = require('fs');

const wb = XLSX.readFile('C:/Users/alfaj/Downloads/قائمة الباصات.xlsx');
const ws = wb.Sheets['كل الباصات'];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 }).slice(1);

const rows = data.filter(r => r[2] && r[3]).map(r => ({
  name: String(r[2]).trim(),
  phone: String(r[3]).trim()
}));

console.log('Total rows with phone:', rows.length);

// Generate SQL
const cases = rows.map(r => {
  const safeName = r.name.replace(/'/g, "''");
  return `  WHEN full_name = '${safeName}' THEN '${r.phone}'`;
}).join('\n');

const sql = `UPDATE bus_distribution SET phone = CASE\n${cases}\n  ELSE phone\nEND\nWHERE full_name IN (${rows.map(r => `'${r.name.replace(/'/g, "''")}'`).join(',')});`;

fs.writeFileSync('C:/Users/alfaj/alfajr-hajj/update_phones.sql', sql);
console.log('SQL written to update_phones.sql');
console.log('Sample:', rows.slice(0,3));
