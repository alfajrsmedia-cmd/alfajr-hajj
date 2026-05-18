const pdfLib = require('pdf-parse')
const fs = require('fs')

async function main() {
  const buf = fs.readFileSync('C:\\Users\\alfaj\\Downloads\\اسماء الحجاج.pdf')

  // Try using PDFParse with proper options
  const PDFParse = pdfLib.PDFParse
  const VerbosityLevel = pdfLib.VerbosityLevel

  const parser = new PDFParse({ verbosity: VerbosityLevel ? VerbosityLevel.ERRORS : 0 })
  const result = await parser.parse(buf)
  const text = result.text

  console.error('Pages:', result.numpages, 'TextLen:', text.length)
  // Print first 2000 chars to see format
  console.error('SAMPLE:', text.substring(0, 2000))
}

main().catch(e => { console.error('ERR:', e.message); process.exit(1) })
