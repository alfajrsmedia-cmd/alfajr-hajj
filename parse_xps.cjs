const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Extract XPS (ZIP) and read fpage files
function parseXPS(xpsPath) {
  const tmpDir = xpsPath + '_extracted';

  // Extract using PowerShell
  if (!fs.existsSync(tmpDir)) {
    execSync(`powershell -Command "Expand-Archive -Path '${xpsPath}' -DestinationPath '${tmpDir}' -Force"`, { stdio: 'pipe' });
  }

  // Find all fpage files
  const pagesDir = path.join(tmpDir, 'Documents', '1', 'Pages');
  if (!fs.existsSync(pagesDir)) {
    console.log('No pages dir in', xpsPath);
    return [];
  }

  const fpages = fs.readdirSync(pagesDir)
    .filter(f => f.endsWith('.fpage'))
    .sort((a, b) => parseInt(a) - parseInt(b));

  const allStrings = [];
  for (const fp of fpages) {
    const content = fs.readFileSync(path.join(pagesDir, fp));
    // Try UTF-16LE first, then UTF-8
    let text;
    try { text = content.toString('utf16le'); }
    catch { text = content.toString('utf8'); }

    const matches = [...text.matchAll(/UnicodeString="([^"]+)"/g)].map(m => m[1].trim()).filter(s => s);
    allStrings.push(...matches);
  }

  return allStrings;
}

const files = ['1.xps', '2.xps', '3.xps', '4.xps', '5.xps', '6.xps'];
const BASE = 'C:/Users/alfaj/Downloads';

for (const f of files) {
  const xpsPath = path.join(BASE, f);
  if (!fs.existsSync(xpsPath)) { console.log('Not found:', f); continue; }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`FILE: ${f}`);
  console.log('='.repeat(60));

  const strings = parseXPS(xpsPath);
  console.log(`Total strings: ${strings.length}`);
  console.log('First 50:');
  strings.slice(0, 50).forEach((s, i) => console.log(`  [${i}] ${s}`));
}
