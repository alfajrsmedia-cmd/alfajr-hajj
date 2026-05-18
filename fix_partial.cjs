const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://gnsdsisqsltxoujfslvf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Jkx9OWee5RXdeu-uTtw4kg_RsUnPNkF';

const BASE = 'C:/Users/alfaj/Downloads/تصاريح الحج 1447-20260516T142319Z-3-001/تصاريح الحج 1447';

// High-confidence matches: DB id -> actual file path
const targets = [
  { id: 325, file: path.join(BASE, 'اداريي و حجاج الفجر/حجاج/سلوى ابراهيم عاشور عاشور.pdf') },
  { id: 718, file: path.join(BASE, 'اداريي و حجاج الفجر/حجاج/موزه طالب ابراهيم بن المرى.pdf') },
  { id: 703, file: path.join(BASE, 'اداريي و حجاج الفجر/حجاج/الشيخ محمد بن احمد بن محمد بن سلطان.pdf') },
  { id: 704, file: path.join(BASE, 'اداريي و حجاج الفجر/حجاج/الشيخ سالم بن احمد بن محمد بن سلطان.pdf') },
  { id: 101, file: path.join(BASE, 'اداريي و حجاج الفجر/حجاج/احمد عبدالله عبدالرحمن على.pdf') },
];

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
    if (!fs.existsSync(t.file)) {
      console.log(`⚠️  File not found: ${path.basename(t.file)}`);
      continue;
    }
    console.log(`⬆️  [${t.id}] ${path.basename(t.file)}`);
    const storagePath = await uploadFile(t.file, t.id);
    if (storagePath) {
      const ok = await updatePilgrim(t.id, storagePath);
      if (ok) { fixed++; console.log(`  ✅ Done`); }
      else console.log(`  ⚠️ Upload OK but DB update failed`);
    }
  }
  console.log(`\n✅ Fixed: ${fixed}/${targets.length}`);
}

main().catch(console.error);
