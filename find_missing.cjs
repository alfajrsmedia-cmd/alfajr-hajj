const fs = require('fs');
const path = require('path');

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

// Build map of normalized filename -> full path
const allFiles = new Map();
FOLDERS.forEach(folder => {
  if (!fs.existsSync(folder)) return;
  fs.readdirSync(folder).filter(f => f.endsWith('.pdf')).forEach(f => {
    const key = normalize(f);
    if (!allFiles.has(key)) allFiles.set(key, path.join(folder, f));
  });
});

const missing = [
  { id: 409, name: 'أحلام يوسف محمد بوالصفارد البلوشى' },
  { id: 755, name: 'أسماء محمد علي الصباغ' },
  { id: 101, name: 'امل احمد محمد الهلال' },
  { id: 704, name: 'بدرية علي عبدالله محمد الجابري' },
  { id: 703, name: 'حنين يوسف محمد بوالصفارد البلوشى' },
  { id: 660, name: 'خديجة محمد امان سعيد السندي' },
  { id: 748, name: 'خلود زكريا حامد المنيعي' },
  { id: 735, name: 'رغد سيف سلطان خميس الكعبى' },
  { id: 407, name: 'سلوى خلف حمد الفنيخ' },
  { id: 602, name: 'صالح جاسم عبدالله درويش البيرم' },
  { id: 325, name: 'عبدالله سلطان محمد علي الكعبي' },
  { id: 336, name: 'عبدالله محمد جاسم محمد الحمادي' },
  { id: 751, name: 'عزيزة حمدان مبارك سعيد السويدي' },
  { id: 312, name: 'علي حمد خلفان علي المزروعي' },
  { id: 747, name: 'فاطمة بنت سالم بن خميس الزدجالي' },
  { id: 752, name: 'فاطمة عبدالله جاسم محمد الحمادي' },
  { id: 749, name: 'فاطمة محمد عبدالله سيف الدرعي' },
  { id: 33,  name: 'محمد الامين محمد ابراهيم' },
  { id: 734, name: 'محمد سعد محمد سعد الملا' },
  { id: 136, name: 'محمد عبدالله راشد محمد العامري' },
  { id: 463, name: 'مريم محمد حسن عبدالله الزعابي' },
  { id: 603, name: 'منى عبدالله جاسم محمد الحمادي' },
  { id: 718, name: 'نورة فلاح عبدالله علي الجابري' },
];

console.log('=== بحث عن التصاريح الناقصة ===\n');

// Try exact normalized match first
const notFound = [];
for (const p of missing) {
  const key = normalize(p.name);
  if (allFiles.has(key)) {
    console.log(`✅ وُجد (تطابق تام): [${p.id}] ${p.name}`);
    console.log(`   => ${allFiles.get(key)}`);
  } else {
    notFound.push(p);
  }
}

console.log('\n=== لم يوجد بتطابق تام - بحث جزئي ===\n');

// For not found, try partial word match
for (const p of notFound) {
  const key = normalize(p.name);
  const words = key.split(' ').filter(w => w.length > 3);

  const candidates = [];
  for (const [fileKey, filePath] of allFiles) {
    const matches = words.filter(w => fileKey.includes(w));
    if (matches.length >= 2) {
      candidates.push({ fileKey, filePath, score: matches.length });
    }
  }
  candidates.sort((a, b) => b.score - a.score);

  console.log(`❓ [${p.id}] ${p.name}`);
  console.log(`   key: ${key}`);
  if (candidates.length === 0) {
    console.log(`   => لا يوجد تطابق جزئي`);
  } else {
    candidates.slice(0, 3).forEach(c => console.log(`   [${c.score}/${words.length}] ${c.fileKey}`));
  }
  console.log();
}
