import XLSX from './node_modules/xlsx/xlsx.mjs';
import { readFileSync, writeFileSync } from 'fs';

const wb = XLSX.readFile('C:/Users/alfaj/Downloads/كشف التسكين بالحملة (2).xlsx');
const ws = wb.Sheets['Query17'];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 }).slice(1);

const fajr = data.filter(r => r[0] === 'الفجر');
console.log('الفجر count:', fajr.length);

let cases = '';
const passports = [];
fajr.forEach(r => {
  const passport = String(r[3]).trim();
  const roomType = String(r[5]).trim();
  cases += `  WHEN '${passport}' THEN '${roomType}'\n`;
  passports.push(`'${passport}'`);
});

const sql = `UPDATE pilgrims SET room_type = CASE passport_number\n${cases}  ELSE room_type\nEND\nWHERE passport_number IN (${passports.join(',')});`;
writeFileSync('C:/Users/alfaj/alfajr-hajj/update_room_type.sql', sql);
console.log('Done. Total rows:', fajr.length);
console.log('Sample:');
sql.split('\n').slice(0, 6).forEach(l => console.log(l));
