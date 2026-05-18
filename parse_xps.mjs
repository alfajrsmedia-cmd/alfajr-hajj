import { readFileSync, readdirSync, writeFileSync } from 'fs'
import { join } from 'path'

const PAGES_DIR = 'C:\\Users\\alfaj\\Downloads\\xps_extract\\Documents\\1\\Pages'

function extractGlyphs(xml) {
  const items = []
  const pattern = /<Glyphs\s[^>]+>/gs
  let m
  while ((m = pattern.exec(xml)) !== null) {
    const el = m[0]
    const textMatch = el.match(/UnicodeString="([^"]*)"/)
    const xMatch = el.match(/OriginX="([^"]+)"/)
    const yMatch = el.match(/OriginY="([^"]+)"/)
    if (textMatch && xMatch && yMatch) {
      const text = textMatch[1].trim()
      if (text) {
        items.push({
          x: parseFloat(xMatch[1]),
          y: parseFloat(yMatch[1]),
          text
        })
      }
    }
  }
  return items
}

function roundY(y) { return Math.round(y / 1.5) * 1.5 }

// Empirical X ranges from analysis:
// row_num ~578, group ~532, name ~514, passport_letters ~290, passport_nums ~301-312,
// nationality ~277, issue ~175-212, expiry ~118-155, birth ~57-94
function assignColumn(x) {
  if (x >= 560) return 'row_num'
  if (x >= 520 && x < 560) return 'group'
  if (x >= 350 && x < 520) return 'name'
  if (x >= 285 && x < 350) return 'passport'  // only letters+numbers, NOT nationality
  if (x >= 255 && x < 285) return 'nationality' // nationality at ~277
  if (x >= 160 && x < 255) return 'issue_date'
  if (x >= 100 && x < 160) return 'expiry_date'
  if (x >= 40 && x < 100) return 'birth_date'
  return null
}

const allPilgrims = []

const pageFiles = readdirSync(PAGES_DIR)
  .filter(f => f.match(/^\d+\.fpage$/))
  .sort((a, b) => parseInt(a) - parseInt(b))

let skippedRows = []

for (const pageFile of pageFiles) {
  const xml = readFileSync(join(PAGES_DIR, pageFile), 'utf16le')
  const items = extractGlyphs(xml)

  const rows = new Map()
  for (const item of items) {
    const ry = roundY(item.y)
    if (!rows.has(ry)) rows.set(ry, [])
    rows.get(ry).push(item)
  }

  const sortedYs = [...rows.keys()].sort((a, b) => a - b)

  for (const ry of sortedYs) {
    const rowItems = rows.get(ry)
    const cols = {}
    for (const item of rowItems) {
      const col = assignColumn(item.x)
      if (!col) continue
      if (!cols[col]) cols[col] = []
      cols[col].push(item)
    }

    if (!cols.row_num) continue

    const rowNumText = cols.row_num.map(i => i.text).join('').trim()
    const rowNum = parseInt(rowNumText)
    if (isNaN(rowNum)) continue

    if (!cols.name) {
      skippedRows.push({ page: pageFile, ry, rowNum, items: rowItems.map(i => `X=${i.x.toFixed(1)} "${i.text}"`) })
      continue
    }

    const groupText = cols.group ? cols.group.map(i => i.text).join('').trim() : ''
    const groupNum = parseInt(groupText)

    const nameText = cols.name ? cols.name.sort((a, b) => b.x - a.x).map(i => i.text).join(' ').trim() : ''
    const natText = cols.nationality ? cols.nationality.map(i => i.text).join('').trim() : ''

    const passportItems = cols.passport ? cols.passport.sort((a, b) => a.x - b.x) : []
    const passportText = passportItems.map(i => i.text).join('').trim()

    const birthText = reconstructDate(cols.birth_date || [])
    const issueText = reconstructDate(cols.issue_date || [])
    const expiryText = reconstructDate(cols.expiry_date || [])

    allPilgrims.push({
      row: rowNum,
      group_number: isNaN(groupNum) ? null : groupNum,
      full_name: nameText,
      passport_number: passportText,
      nationality: natText,
      birth_date: birthText,
      issue_date: issueText,
      expiry_date: expiryText
    })
  }
}

function reconstructDate(parts) {
  const sorted = parts.filter(p => p.text !== '/').sort((a, b) => a.x - b.x)
  if (sorted.length === 0) return ''
  const texts = sorted.map(p => p.text)
  let year = '', month = '', day = ''
  for (const t of texts) {
    if (/^\d{4}$/.test(t)) year = t
    else if (/^\d{2}$/.test(t) && !month) month = t
    else if (/^\d{2}$/.test(t)) day = t
    else if (/^\d{1}$/.test(t)) day = '0' + t
  }
  if (year && month && day) return `${year}/${month}/${day}`
  if (year && month) return `${year}/${month}`
  return texts.join('')
}

allPilgrims.sort((a, b) => a.row - b.row)

console.log(`Total pilgrims parsed: ${allPilgrims.length}`)
console.log('Sample (first 3):')
allPilgrims.slice(0, 3).forEach(p => console.log(JSON.stringify(p)))
console.log('\nSkipped rows:', skippedRows.length)
if (skippedRows.length > 0) {
  console.log('First skipped:')
  skippedRows.slice(0, 3).forEach(r => console.log(JSON.stringify(r)))
}

writeFileSync('C:\\Users\\alfaj\\alfajr-hajj\\pilgrims_parsed.json', JSON.stringify(allPilgrims, null, 2), 'utf8')
console.log('\nSaved to pilgrims_parsed.json')
