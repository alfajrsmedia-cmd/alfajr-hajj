'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type MinaRow = {
  id: number
  group_number: number
  full_name: string
  gender: string
  tent_number: number
}

export default function MinaCampsPage() {
  const [rows, setRows] = useState<MinaRow[]>([])
  const [filtered, setFiltered] = useState<MinaRow[]>([])
  const [search, setSearch] = useState('')
  const [activeTent, setActiveTent] = useState(0)
  const [activeGender, setActiveGender] = useState('الكل')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    const { data } = await supabase
      .from('mina_camps')
      .select('*')
      .order('tent_number')
    if (data) { setRows(data); setFiltered(data) }
    setLoading(false)
  }

  // حساب الإحصائيات
  const tents = [...new Set(rows.map(r => r.tent_number))].sort((a, b) => a - b)
  const totalMen = rows.filter(r => r.gender === 'رجال').length
  const totalWomen = rows.filter(r => r.gender === 'نساء').length

  useEffect(() => {
    let result = rows
    if (activeTent !== 0) result = result.filter(r => r.tent_number === activeTent)
    if (activeGender !== 'الكل') result = result.filter(r => r.gender === activeGender)
    if (search.trim()) {
      const q = search.trim()
      result = result.filter(r =>
        r.full_name?.includes(q) ||
        String(r.group_number)?.includes(q) ||
        String(r.tent_number)?.includes(q)
      )
    }
    setFiltered(result)
  }, [activeTent, activeGender, search, rows])

  return (
    <div className="p-6" dir="rtl">
      {/* العنوان */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">🏕️ مخيمات منى</h1>
        <p className="text-gray-500 text-sm">توزيع الحجاج على خيام منى</p>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
          <p className="text-3xl font-bold text-emerald-600">{rows.length}</p>
          <p className="text-gray-500 text-sm mt-1">إجمالي الحجاج</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
          <p className="text-3xl font-bold text-blue-600">{tents.length}</p>
          <p className="text-gray-500 text-sm mt-1">عدد الخيام</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
          <p className="text-3xl font-bold text-indigo-600">{totalMen}</p>
          <p className="text-gray-500 text-sm mt-1">رجال</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
          <p className="text-3xl font-bold text-rose-500">{totalWomen}</p>
          <p className="text-gray-500 text-sm mt-1">نساء</p>
        </div>
      </div>

      {/* فلتر الجنس */}
      <div className="flex gap-2 mb-4">
        {['الكل', 'رجال', 'نساء'].map(g => (
          <button key={g} onClick={() => setActiveGender(g)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              activeGender === g
                ? g === 'رجال' ? 'bg-indigo-600 text-white shadow'
                  : g === 'نساء' ? 'bg-rose-500 text-white shadow'
                  : 'bg-emerald-600 text-white shadow'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
            }`}>
            {g}
          </button>
        ))}
      </div>

      {/* فلتر الخيام */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button onClick={() => setActiveTent(0)}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
            activeTent === 0 ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
          }`}>
          الكل
        </button>
        {tents.map(t => (
          <button key={t} onClick={() => setActiveTent(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              activeTent === t ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
            }`}>
            خيمة {t}
          </button>
        ))}
      </div>

      {/* البحث */}
      <div className="mb-5">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="ابحث بالاسم، رقم المجموعة، رقم الخيمة..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
      </div>

      <div className="mb-3 text-sm text-gray-500">
        {loading ? 'جاري التحميل...' : `${filtered.length} حاج`}
      </div>

      {/* الجدول */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-emerald-600 text-white">
                  <th className="px-4 py-3 text-right">#</th>
                  <th className="px-4 py-3 text-right">الخيمة</th>
                  <th className="px-4 py-3 text-right">المجموعة</th>
                  <th className="px-4 py-3 text-right">الاسم</th>
                  <th className="px-4 py-3 text-right">الجنس</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-gray-400">لا توجد نتائج</td></tr>
                ) : filtered.map((r, i) => (
                  <tr key={r.id} className={`border-b border-gray-100 hover:bg-emerald-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                        خيمة {r.tent_number}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.group_number}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{r.full_name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        r.gender === 'رجال'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-rose-100 text-rose-600'
                      }`}>
                        {r.gender}
                      </span>
                    </td>
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
