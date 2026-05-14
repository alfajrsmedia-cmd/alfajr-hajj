'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import AdminSidebar from '@/components/AdminSidebar'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Pilgrim = {
  id: number
  campaign: string
  ref_number: number
  national_id: string
  passport_number: string
  full_name: string
  booking_type: string
  room_number: number
}

export default function CampaignPage() {
  const [pilgrims, setPilgrims] = useState<Pilgrim[]>([])
  const [filtered, setFiltered] = useState<Pilgrim[]>([])
  const [search, setSearch] = useState('')
  const [activeCampaign, setActiveCampaign] = useState('الكل')
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState<Record<string, number>>({})

  const campaigns = ['الكل', 'الفجر', 'المسعى', 'المصطفى']

  useEffect(() => { fetchPilgrims() }, [])

  async function fetchPilgrims() {
    setLoading(true)
    const { data } = await supabase
      .from('campaign_pilgrims')
      .select('*')
      .order('campaign')
    if (data) {
      setPilgrims(data)
      setFiltered(data)
      const c: Record<string, number> = {}
      data.forEach((p) => { c[p.campaign] = (c[p.campaign] || 0) + 1 })
      setCounts(c)
    }
    setLoading(false)
  }

  useEffect(() => {
    let result = pilgrims
    if (activeCampaign !== 'الكل') result = result.filter((p) => p.campaign === activeCampaign)
    if (search.trim()) {
      const q = search.trim()
      result = result.filter((p) =>
        p.full_name?.includes(q) || p.passport_number?.includes(q) ||
        p.national_id?.includes(q) || String(p.ref_number)?.includes(q) ||
        String(p.room_number)?.includes(q)
      )
    }
    setFiltered(result)
  }, [activeCampaign, search, pilgrims])

  return (
   <div className="flex min-h-screen bg-slate-50 w-full overflow-hidden" dir="rtl">
      <AdminSidebar />
<main className="flex-1 w-0 md:mr-64 p-6">
  <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">قسم الحملة</h1>
          <p className="text-gray-500 text-sm">إجمالي الحجاج: {pilgrims.length}</p>
        </div>
        <div className="flex flex-wrap gap-3 mb-5">
          {campaigns.map((c) => {
            const count = c === 'الكل' ? pilgrims.length : (counts[c] || 0)
            return (
              <button key={c} onClick={() => setActiveCampaign(c)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeCampaign === c
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}>
                {c} ({count})
              </button>
            )
          })}
        </div>
        <div className="mb-5">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم، الجواز، الهوية، المرجع، رقم الغرفة..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        </div>
        <div className="mb-3 text-sm text-gray-500">
          {loading ? 'جاري التحميل...' : `${filtered.length} حاج`}
        </div>
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
                    <th className="px-4 py-3 text-right">الحملة</th>
                    <th className="px-4 py-3 text-right">الاسم</th>
                    <th className="px-4 py-3 text-right">رقم الجواز</th>
                    <th className="px-4 py-3 text-right">رقم الهوية</th>
                    <th className="px-4 py-3 text-right">المرجع</th>
                    <th className="px-4 py-3 text-right">نوع الحجز</th>
                    <th className="px-4 py-3 text-right">الغرفة</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-12 text-gray-400">لا توجد نتائج</td></tr>
                  ) : filtered.map((p, i) => (
                    <tr key={p.id} className={`border-b border-gray-100 hover:bg-emerald-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          p.campaign === 'الفجر' ? 'bg-emerald-100 text-emerald-700' :
                          p.campaign === 'المسعى' ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>{p.campaign}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">{p.full_name}</td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">{p.passport_number}</td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">{p.national_id}</td>
                      <td className="px-4 py-3 text-gray-500">{p.ref_number}</td>
                      <td className="px-4 py-3 text-gray-600">{p.booking_type}</td>
                      <td className="px-4 py-3 font-bold text-emerald-700">{p.room_number}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
