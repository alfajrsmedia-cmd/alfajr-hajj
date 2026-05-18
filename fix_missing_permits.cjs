const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://gnsdsisqsltxoujfslvf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Jkx9OWee5RXdeu-uTtw4kg_RsUnPNkF';

const BASE = 'C:/Users/alfaj/Downloads/تصاريح الحج 1447-20260516T142319Z-3-001/تصاريح الحج 1447';
const FOLDERS = [
  path.join(BASE, 'اداريي و حجاج الفجر/حجاج'),
  path.join(BASE, 'اداريي و حجاج الفجر/اداريين'),
  path.join(BASE, 'تصاريح حجاج المسعى 1'),
  path.join(BASE, 'تصاريح حجاج المصطفى 1'),
];

function normalize(name) {
  return name
    .replace(/\.pdf$/i, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ةه]/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim();
}

// The 11 pilgrims that can be fixed
const targets = [
  { id: 738, name: 'احمد  المسومى' },
  { id: 739, name: 'احمد لشكرى احمد إبراهيم البلوشى' },
  { id: 743, name: 'سلطان احمد عبيد احمد البح' },
  { id: 732, name: 'سيف خالد محمد القاضي الشامسى' },
  { id: 740, name: 'سيف عبدالله محمد سلطان الشريف' },
  { id: 731, name: 'عادل عبيد احمد عبيد البح' },
  { id: 742, name: 'عبدالله محمد مراد احمد المازمى' },
  { id: 737, name: 'عبيد عادل عبيد احمد البح' },
  { id: 736, name: 'محمد عادل عبيد احمد البح' },
  { id: 730, name: 'هيفاء محمد سيف الدبوس السويدى' },
  { id: 733, name: 'وداد سيف سلطان خميس الكعبى' },
];

// Build a map of all PDFs by normalized name
const allFiles = new Map();
FOLDERS.forEach(folder => {
  if (!fs.existsSync(folder)) { console.log('Folder not found:', folder); return; }
  fs.readdirSync(folder).filter(f => f.endsWith('.pdf')).forEach(f => {
    const key = normalize(f);
    if (!allFiles.has(key)) allFiles.set(key, path.join(folder, f));
  });
});
console.log('Total unique PDFs indexed:', allFiles.size);

async function uploadFile(filePath, pilgrimId) {
  const buf = fs.readFileSync(filePath);
  const storageName = `permits/${pilgrimId}.pdf`;
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/pilgrim-docs/${storageName}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/pdf',
      'x-upsert': 'true',
    },
    body: buf
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error(`  Upload failed [${res.status}]:`, txt.slice(0, 120));
    return null;
  }
  return storageName;
}

async function updatePilgrim(id, storagePath) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/pilgrims?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ permit_photo_path: storagePath })
  });
  return res.ok;
}

async function main() {
  let fixed = 0;
  for (const t of targets) {
    const key = normalize(t.name);
    const filePath = allFiles.get(key);
    if (!filePath) {
      console.log(`❌ Not found: [${t.id}] ${t.name} (key: ${key})`);
      continue;
    }
    console.log(`⬆️  Uploading [${t.id}] ${t.name}`);
    const storagePath = await uploadFile(filePath, t.id);
    if (storagePath) {
      const ok = await updatePilgrim(t.id, storagePath);
      if (ok) { fixed++; console.log(`  ✅ Done`); }
      else console.log(`  ⚠️ Upload OK but DB update failed`);
    }
  }
  console.log(`\n✅ Fixed: ${fixed}/${targets.length}`);
}

main().catch(console.error);
