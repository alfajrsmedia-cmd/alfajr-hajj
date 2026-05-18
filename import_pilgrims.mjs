import { createRequire } from 'module'
import { readFileSync } from 'fs'
const require = createRequire(import.meta.url)
const { PDFParse } = require('pdf-parse')

const dataBuffer = readFileSync('C:\\Users\\alfaj\\Downloads\\اسماء الحجاج.pdf')
const parser = new PDFParse()
const result = await parser.parse(dataBuffer)
const text = result.text

console.log('Total pages:', result.numpages)

// Split into lines and filter empty
const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)

const pilgrims = []

for (const line of lines) {
  // Skip header/footer lines
  if (line.includes('صفحة') || line.includes('الفجر للحج') || line.includes('تسكين') ||
      line.includes('الموقع') || line.includes('م.') || line.includes('اسم الحاج') ||
      line.includes('هاتف') || line.includes('دولة') || line.includes('فندق') ||
      line.includes('الجنسية') || line.includes('المجموعة')) continue

  // Find lines with dates (data rows)
  const dates = line.match(/\d{4}\/\d{2}\/\d{2}/g)
  if (!dates || dates.length < 1) continue

  // Match: rowNum groupNum name passport nationality issue_date expiry_date birth_date
  const numMatch = line.match(/^(\d+)\s+(\d+)\s+(.+?)\s+([A-Z0-9]{5,15})\s+(الامارات|عمان|المغرب|سوريا|موريتانيا)\s+(\d{4}\/\d{2}\/\d{2})\s+(\d{4}\/\d{2}\/\d{2})\s+(\d{4}\/\d{2}\/\d{2})/)

  if (numMatch) {
    const [, rowNum, groupNum, name, passport, nationality, issueDate, expiryDate, birthDate] = numMatch
    pilgrims.push({
      row: parseInt(rowNum),
      group_number: parseInt(groupNum),
      full_name: name.trim(),
      passport_number: passport.trim(),
      nationality: nationality.trim(),
      birth_date: birthDate
    })
  }
}

console.log(`Parsed ${pilgrims.length} pilgrims`)
pilgrims.slice(0, 10).forEach(p => console.log(JSON.stringify(p)))
