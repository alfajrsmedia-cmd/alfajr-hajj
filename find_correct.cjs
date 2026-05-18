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

// Build all files index
const allFiles = new Map();
FOLDERS.forEach(folder => {
  if (!fs.existsSync(folder)) return;
  fs.readdirSync(folder).filter(f => f.endsWith('.pdf')).forEach(f => {
    const key = normalize(f);
    if (!allFiles.has(key)) allFiles.set(key, path.join(folder, f));
  });
});

// Correct DB names
const missing = [
  { id: 602, name: 'حسين على عبدالمحسن الراشد' },
  { id: 660, name: 'الصغيره سعيد  سلطان' },
  { id: 409, name: 'أحلام يوسف محمد بوالصفارد البلوشى' },
  { id: 718, name: 'موزه طالب إبراهيم بن طالب المرى' },
  { id: 703, name: 'الشيخ محمد بن احمد بن محمد بن سلطان القاسمى' },
  { id: 336, name: 'شرينه محمد عبدالله زعل الفلاسى' },
  { id: 755, name: 'إسماعيل إبراهيم محمد امين البلوشى' },
  { id: 33,  name: 'عهود بنت محمد بن سلام' },
  { id: 603, name: 'مريم على عيسى حسن الصابرى' },
  { id: 101, name: 'احمد عبدالله عبدالرحمن عبدالله على' },
  { id: 325, name: 'سلوى ابراهيم  عاشور' },
  { id: 735, name: 'بلال رياض قيمه' },
  { id: 734, name: 'محمد انس احمد عروب' },
  { id: 752, name: 'عبدالله محمد مفتاح على الخاطرى' },
  { id: 751, name: 'عبدالكريم محمد جراد' },
  { id: 748, name: 'امل على حمود راشد الزيودى' },
  { id: 749, name: 'على راشد خميس برشود الحمودى' },
  { id: 704, name: 'الشيخ سالم بن احمد بن محمد بن سلطان القاسمى' },
  { id: 747, name: 'عبدالله على حمود راشد الزيودى' },
  { id: 312, name: 'عبدالله ابراهيم عبدالله الجويعد' },
  { id: 407, name: 'حسن على ابراهيم محمد البلوشى' },
  { id: 136, name: 'محمد راشد خميس الشامسي' },
  { id: 463, name: 'محمد على سلمان المرزوقى' },
];

const canFix = [];
const noFile = [];

for (const p of missing) {
  const key = normalize(p.name);
  if (allFiles.has(key)) {
    canFix.push({ ...p, filePath: allFiles.get(key) });
    console.log(`✅ [${p.id}] ${p.name}`);
    continue;
  }

  // Partial word match
  const words = key.split(' ').filter(w => w.length > 2);
  const candidates = [];
  for (const [fileKey, filePath] of allFiles) {
    const matches = words.filter(w => fileKey.includes(w));
    if (matches.length >= Math.max(2, words.length - 1)) {
      candidates.push({ fileKey, filePath, score: matches.length, total: words.length });
    }
  }
  candidates.sort((a, b) => b.score - a.score);

  if (candidates.length > 0 && candidates[0].score >= words.length - 1) {
    console.log(`🔶 [${p.id}] ${p.name}`);
    console.log(`   key: "${key}"`);
    candidates.slice(0,3).forEach(c => console.log(`   [${c.score}/${c.total}] ${c.fileKey}`));
  } else {
    noFile.push(p);
    console.log(`❌ [${p.id}] ${p.name}`);
    if (candidates.length > 0) candidates.slice(0,2).forEach(c => console.log(`   [${c.score}/${c.total}] ${c.fileKey}`));
  }
}

console.log(`\n✅ وُجد تطابق تام: ${canFix.length}`);
console.log(`🔶 وُجد تطابق جزئي: ${missing.length - canFix.length - noFile.length}`);
console.log(`❌ لا يوجد ملف: ${noFile.length}`);
if (noFile.length > 0) {
  console.log('\nالحجاج الذين لا يوجد لهم ملف:');
  noFile.forEach(p => console.log(` - [${p.id}] ${p.name}`));
}
