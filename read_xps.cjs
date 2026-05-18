const fs = require('fs');
const path = require('path');

function readXPS(dirPath, fileNum) {
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

const BASE = 'C:/Users/alfaj/Downloads';

for (let i = 1; i <= 6; i++) {
  const dir = path.join(BASE, `${i}_xps`);
  if (!fs.existsSync(dir)) { console.log(`Not found: ${i}_xps`); continue; }

  const strings = readXPS(dir, i);
  console.log(`\n${'='.repeat(70)}`);
  console.log(`FILE ${i}.xps — Total strings: ${strings.length}`);
  console.log('='.repeat(70));
  // Print first 60 strings to understand structure
  strings.slice(0, 60).forEach((s, idx) => console.log(`[${idx}] ${s}`));
}
