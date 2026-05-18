const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://gnsdsisqsltxoujfslvf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Jkx9OWee5RXdeu-uTtw4kg_RsUnPNkF';

const BASE = 'C:/Users/alfaj/Downloads/تصاريح الحج 1447-20260516T142319Z-3-001/تصاريح الحج 1447';
const FOLDERS = [
  path.join(BASE, 'اداريي و حجاج الفجر/حجاج'),
  path.join(BASE, 'تصاريح حجاج المسعى 1'),
  path.join(BASE, 'تصاريح حجاج المصطفى 1'),
];

const allFiles = [];
FOLDERS.forEach(folder => {
  if (!fs.existsSync(folder)) return;
  fs.readdirSync(folder).filter(f => f.endsWith('.pdf'))
    .forEach(f => allFiles.push({ file: f, folder }));
});
console.log('Total PDFs:', allFiles.length);

async function fetchPilgrims() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/pilgrims?select=id,full_name&limit=2000`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
  });
  return await res.json();
}

// رفع باستخدام ID الحاج كاسم الملف
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
    console.error(`Upload failed [${res.status}]:`, txt.slice(0, 120));
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

function normalize(name) {
  return name
    .replace(/\.pdf$/i, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ةه]/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  const pilgrims = await fetchPilgrims();
  console.log('Pilgrims in DB:', pilgrims.length);

  const nameMap = new Map();
  pilgrims.forEach(p => nameMap.set(normalize(p.full_name), p.id));

  let uploaded = 0, matched = 0, notFound = 0;
  const missing = [];

  for (let i = 0; i < allFiles.length; i++) {
    const { file, folder } = allFiles[i];
    const nameFromFile = normalize(file);
    const pilgrimId = nameMap.get(nameFromFile);

    if (!pilgrimId) {
      notFound++;
      missing.push(file.replace('.pdf', ''));
      continue;
    }

    const storagePath = await uploadFile(path.join(folder, file), pilgrimId);
    if (storagePath) {
      uploaded++;
      await updatePilgrim(pilgrimId, storagePath);
      matched++;
    }

    if ((i + 1) % 50 === 0) {
      console.log(`Progress: ${i + 1}/${allFiles.length} | uploaded: ${uploaded} | matched: ${matched} | not found: ${notFound}`);
    }
  }

  console.log(`\n✅ Done!`);
  console.log(`Uploaded: ${uploaded}`);
  console.log(`Matched & updated: ${matched}`);
  console.log(`Not found in DB: ${notFound}`);
  if (missing.length > 0) {
    console.log('\nFirst 15 not matched:');
    missing.slice(0, 15).forEach(n => console.log(' -', n));
  }
}

main().catch(console.error);
