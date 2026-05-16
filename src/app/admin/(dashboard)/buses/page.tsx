'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Printer } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type BusRow = {
  id: number
  campaign: string
  bus_number: number
  ref_number: number
  national_id: string
  passport_number: string
  group_number: number
  full_name: string
  phone?: string
}

export default function BusesPage() {
  const [rows, setRows] = useState<BusRow[]>([])
  const [filtered, setFiltered] = useState<BusRow[]>([])
  const [search, setSearch] = useState('')
  const [activeBus, setActiveBus] = useState(0)
  const [activeCampaign, setActiveCampaign] = useState('الكل')
  const [loading, setLoading] = useState(true)
  const printRef = useRef<HTMLDivElement>(null)

  const campaigns = ['الكل', 'الفجر', 'المسعى', 'المصطفى']
  const buses = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    const { data: busData } = await supabase
      .from('bus_distribution')
      .select('*')
      .order('bus_number')

    if (busData) {
      const passports = busData.map(r => r.passport_number).filter(Boolean)
      const { data: pilgrimsData } = await supabase
        .from('pilgrims')
        .select('passport_number, phone')
        .in('passport_number', passports)

      const phoneMap: Record<string, string> = {}
      pilgrimsData?.forEach(p => { if (p.passport_number) phoneMap[p.passport_number] = p.phone || '' })

      const merged = busData.map(r => ({ ...r, phone: phoneMap[r.passport_number] || '' }))
      setRows(merged)
      setFiltered(merged)
    }
    setLoading(false)
  }

  useEffect(() => {
    let result = rows
    if (activeBus !== 0) result = result.filter((r) => r.bus_number === activeBus)
    if (activeCampaign !== 'الكل') result = result.filter((r) => r.campaign === activeCampaign)
    if (search.trim()) {
      const q = search.trim()
      result = result.filter((r) =>
        r.full_name?.includes(q) ||
        r.passport_number?.includes(q) ||
        r.national_id?.includes(q) ||
        r.phone?.includes(q) ||
        String(r.ref_number)?.includes(q) ||
        String(r.bus_number)?.includes(q) ||
        String(r.group_number)?.includes(q)
      )
    }
    setFiltered(result)
  }, [activeBus, activeCampaign, search, rows])

  function handlePrint() {
    const busLabel = activeBus !== 0 ? `باص ${activeBus}` : 'كل الباصات'
    const campaignLabel = activeCampaign !== 'الكل' ? ` — ${activeCampaign}` : ''
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const tableRows = filtered.map((r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>باص ${r.bus_number}</td>
        <td>${r.campaign}</td>
        <td>${r.full_name}</td>
        <td>${r.phone || '—'}</td>
        <td>${r.passport_number}</td>
        <td>${r.national_id}</td>
        <td>${r.ref_number}</td>
        <td>${r.group_number}</td>
      </tr>
    `).join('')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>كشف ركاب ${busLabel}${campaignLabel}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Arial', sans-serif; font-size: 12px; color: #000; direction: rtl; }
          .header { text-align: center; padding: 20px; border-bottom: 2px solid #000; margin-bottom: 16px; }
          .header h1 { font-size: 20px; font-weight: bold; margin-bottom: 6px; }
          .header p { font-size: 13px; color: #555; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #1a7a4a; color: white; padding: 8px 6px; font-size: 11px; text-align: right; border: 1px solid #ccc; }
          td { padding: 6px; border: 1px solid #ddd; font-size: 11px; text-align: right; }
          tr:nth-child(even) td { background: #f5f5f5; }
          .footer { margin-top: 20px; text-align: center; font-size: 11px; color: #888; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🚌 كشف ركاب ${busLabel}${campaignLabel}</h1>
          <p>إجمالي الركاب: ${filtered.length} حاج</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>الباص</th>
              <th>الحملة</th>
              <th>الاسم</th>
              <th>الجوال</th>
              <th>رقم الجواز</th>
              <th>رقم الهوية</th>
              <th>المرجع</th>
              <th>المجموعة</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
        <div class="footer">تم الطباعة في ${new Date().toLocaleDateString('ar-SA')}</div>
        <script>window.onload = () => { window.print(); window.close(); }</script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="p-6" dir="rtl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">توزيع الباصات بأسماء الحملة</h1>
          <p className="text-gray-500 text-sm">إجمالي: {rows.length} حاج — {filtered.length} ظاهر</p>
        </div>
        <button
          onClick={handlePrint}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Printer className="w-4 h-4" />
          طباعة {activeBus !== 0 ? `باص ${activeBus}` : 'الكل'}
        </button>
      </div>

      {/* فلتر الحملة */}
      <div className="flex flex-wrap gap-2 mb-4">
        {campaigns.map((c) => (
          <button key={c} onClick={() => setActiveCampaign(c)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              activeCampaign === c ? 'bg-emerald-600 text-white shadow' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
            }`}>
            {c}
          </button>
        ))}
      </div>

      {/* فلتر الباصات */}
      <div className="flex flex-wrap gap-2 mb-5">
        {buses.map((b) => (
          <button key={b} onClick={() => setActiveBus(b)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              activeBus === b ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
            }`}>
            {b === 0 ? 'الكل' : `باص ${b}`}
          </button>
        ))}
      </div>

      {/* البحث */}
      <div className="mb-5">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث بالاسم، الجواز، الهوية، رقم الباص، رقم المجموعة..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
      </div>

      <div className="mb-3 text-sm text-gray-500">{loading ? 'جاري التحميل...' : `${filtered.length} حاج`}</div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="px-4 py-3 text-right">#</th>
                  <th className="px-4 py-3 text-right">الباص</th>
                  <th className="px-4 py-3 text-right">الحملة</th>
                  <th className="px-4 py-3 text-right">الاسم</th>
                  <th className="px-4 py-3 text-right">رقم الجواز</th>
                  <th className="px-4 py-3 text-right">رقم الهوية</th>
                  <th className="px-4 py-3 text-right">المرجع</th>
                  <th className="px-4 py-3 text-right">المجموعة</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-12 text-gray-400">لا توجد نتائج</td></tr>
                ) : filtered.map((r, i) => (
                  <tr key={r.id} className={`border-b border-gray-100 hover:bg-blue-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">باص {r.bus_number}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        r.campaign === 'الفجر' ? 'bg-emerald-100 text-emerald-700' :
                        r.campaign === 'المسعى' ? 'bg-purple-100 text-purple-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>{r.campaign}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{r.full_name}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{r.passport_number}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{r.national_id}</td>
                    <td className="px-4 py-3 text-gray-500">{r.ref_number}</td>
                    <td className="px-4 py-3 text-gray-600">{r.group_number}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{r.phone || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
