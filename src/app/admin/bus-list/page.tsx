'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type BusItem = {
  id: number
  bus_number: number
  group_number: number
  full_name: string
  mobile: string
  mobile_intl: string
}

export default function BusListPage() {
  const [rows, setRows] = useState<BusItem[]>([])
  const [filtered, setFiltered] = useState<BusItem[]>([])
  const [search, setSearch] = useState('')
  const [activeBus, setActiveBus] = useState(0)
  const [loading, setLoading] = useState(true)

  const buses = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    const { data } = await supabase
      .from('bus_list')
      .select('*')
      .order('bus_number')
    if (data) { setRows(data); setFiltered(data) }
    setLoading(false)
  }

  useEffect(() => {
    let result = rows
    if (activeBus !== 0) result = result.filter((r) => r.bus_number === activeBus)
    if (search.trim()) {
      const q = search.trim()
      result = result.filter((r) =>
        r.full_name?.includes(q) ||
        r.mobile?.includes(q) ||
        String(r.bus_number)?.includes(q) ||
        String(r.group_number)?.includes(q)
      )
    }
    setFiltered(result)
  }, [activeBus, search, rows])

  return (
    <div className="p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">قائمة الباصات</h1>
        <p className="text-gray-500 text-sm">إجمالي: {rows.length} حاج</p>
      </div>

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

      <div className="mb-5">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث بالاسم، رقم الجوال، رقم الباص، رقم المجموعة..."
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
                  <th className="px-4 py-3 text-right">المجموعة</th>
                  <th className="px-4 py-3 text-right">الاسم</th>
                  <th className="px-4 py-3 text-right">رقم الجوال</th>
                  <th className="px-4 py-3 text-right">الرقم الدولي</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">لا توجد نتائج</td></tr>
                ) : filtered.map((r, i) => (
                  <tr key={r.id} className={`border-b border-gray-100 hover:bg-blue-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">باص {r.bus_number}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.group_number}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{r.full_name}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono">{r.mobile}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{r.mobile_intl}</td>
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
