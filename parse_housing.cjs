const fs = require('fs');
const path = require('path');

function readAllStrings(dirPath) {
  const pagesDir = path.join(dirPath, 'Documents', '1', 'Pages');
  const fpages = fs.readdirSync(pagesDir)
    .filter(f => f.endsWith('.fpage'))
    .sort((a, b) => parseInt(a) - parseInt(b));

  const allStrings = [];
  for (const fp of fpages) {
    const content = fs.readFileSync(path.join(pagesDir, fp));
    const text = content.toString('utf16le');
    const matches = [...text.matchAll(/UnicodeString="([^"]+)"/g)].map(m => m[1].trim()).filter(s => s);
    allStrings.push(...matches);
  }
  return allStrings;
}

// Detect page boundary: 14 fixed header strings
const HEADER = ['كشف  التسكين', 'دولــة الامـارات العــربية المتحــدة', 'الفجر للحج والعمرة', 'هاتف', ':', '065389222', 'فاكس', ':', '065387077', 'اسم الحاج', 'رقم', 'المجموعة', 'م', '.'];

function splitPages(strings) {
  const pages = [];
  let i = 0;
  while (i < strings.length) {
    // Find next header match
    if (strings.slice(i, i + 14).join('|') === HEADER.join('|')) {
      let j = i + 14;
      // Find next header start or end of strings
      let end = strings.length;
      for (let k = j; k < strings.length - 13; k++) {
        if (strings.slice(k, k + 14).join('|') === HEADER.join('|')) {
          end = k;
          break;
        }
      }
      pages.push(strings.slice(i, end));
      i = end;
    } else {
      i++;
    }
  }
  return pages;
}

function parsePage(page) {
  // page[0..13] = header
  // page[14] = room number
  // page[15..19] = column labels (الدور, /, الشقة, /, الغرفة)
  // page[20] = hotel name
  // page[21] = '-'
  // page[22] = apt number
  // page[23] = '-'
  // page[24] = floor name
  // page[25..] = pilgrims (name, group, seq) × N, then date (5), then page info (4)

  const roomNumber = page[14];
  const hotelName = page[20];
  const aptNumber = page[22];
  const floorName = page[24];

  // Find footer: last 9 strings = [18, /, مايو, /, 2026, صفحة, N, من, total]
  // OR sometimes footer might be different. Let's detect by scanning backwards
  // Page info at end: صفحة, N, من, total (4 strings)
  // Date: 18, /, مايو, /, 2026 (5 strings)
  // Total footer = 9

  const pilgramSection = page.slice(25, page.length - 9);
  const pilgrims = [];
  for (let i = 0; i < pilgramSection.length; i += 3) {
    if (i + 2 < pilgramSection.length) {
      const name = pilgramSection[i];
      const group = pilgramSection[i + 1];
      const seq = pilgramSection[i + 2];
      // Skip if this looks like a footer element
      if (!isNaN(parseInt(seq))) {
        pilgrims.push({ name, group: parseInt(group) || null, seq: parseInt(seq) });
      }
    }
  }

  return { roomNumber, hotelName, aptNumber, floorName, pilgrims };
}

const BASE = 'C:/Users/alfaj/Downloads';
const allRooms = [];

for (let i = 1; i <= 6; i++) {
  const dir = path.join(BASE, `${i}_xps`);
  if (!fs.existsSync(dir)) continue;

  const strings = readAllStrings(dir);
  const pages = splitPages(strings);

  console.log(`File ${i}.xps: ${pages.length} pages`);
  for (const page of pages) {
    const room = parsePage(page);
    allRooms.push(room);
  }
}

console.log(`\nTotal rooms: ${allRooms.length}`);
console.log(`Total pilgrims: ${allRooms.reduce((s, r) => s + r.pilgrims.length, 0)}`);

// Show first 5 rooms as sample
console.log('\nSample rooms:');
allRooms.slice(0, 5).forEach(r => {
  console.log(`\n  Room ${r.roomNumber} | ${r.floorName} | ${r.hotelName} | Apt ${r.aptNumber}`);
  r.pilgrims.forEach(p => console.log(`    - ${p.name} (مجموعة ${p.group})`));
});

// Show last 5 rooms
console.log('\nLast rooms:');
allRooms.slice(-3).forEach(r => {
  console.log(`\n  Room ${r.roomNumber} | ${r.floorName} | ${r.hotelName} | Apt ${r.aptNumber}`);
  r.pilgrims.forEach(p => console.log(`    - ${p.name} (مجموعة ${p.group})`));
});

// Export to JSON
fs.writeFileSync('housing_data.json', JSON.stringify(allRooms, null, 2));
console.log('\n✅ Saved to housing_data.json');
