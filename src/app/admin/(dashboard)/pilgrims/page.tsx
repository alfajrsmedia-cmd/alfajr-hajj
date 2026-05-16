'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function PilgrimsPage() {
  const router = useRouter()
  const [pilgrims, setPilgrims] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 50
  const supabase = createClient()

  const loadPilgrims = useCallback(async () => {
    setLoading(true)
    const s = search.trim()
    let query = supabase
      .from('pilgrims')
      .select(`id, full_name, search_name, groups(group_number, leader_name), housing_assignments(rooms(room_number, floors(floor_number)))`, { count: 'exact' })
      .order('full_name')
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
    if (s) {
      const isNumeric = /^\d+$/.test(s)
      if (isNumeric) {
        const normalized = s.startsWith('971') ? '0' + s.slice(3) : s
        query = query.or(
          `phone.ilike.%${normalized}%,phone.ilike.%${s}%,permit_number::text.ilike.${s}%,national_id.ilike.%${s}%,passport_number.ilike.%${s}%`
        )
      } else {
        const norm = s.replace(/[ً-ٟؐ-ؚٰۖ-ۭ]/g, '')
        query = query.ilike('search_name', `%${norm}%`)
      }
    }
    const { data, count } = await query
    setPilgrims(data || [])
    setTotal(count || 0)
    setLoading(false)
  }, [search, page])

  useEffect(() => { const t = setTimeout(loadPilgrims, 300); return () => clearTimeout(t) }, [loadPilgrims])
  useEffect(() => { setPage(0) }, [search])

  const FLOOR_NAMES: Record<string, string> = { '1': 'الأول', '2': 'الثاني', '3': 'الثالث', '4': 'الرابع', '5': 'الخامس', '6': 'السادس' }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-900">الحجاج</h1>
        <span className="text-sm text-slate-500">{total} حاج</span>
      </div>
      <div className="flex gap-3 mb-5">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="بحث بالاسم..."
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm flex-1 max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-400" />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-right px-4 py-3 font-semibold text-slate-700">#</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-700">الاسم</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-700">المجموعة</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-700">المسؤول</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-700">الدور</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-700">الغرفة</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-2"></div>
                  جاري التحميل...
                </td></tr>
              ) : pilgrims.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">لا توجد نتائج</td></tr>
              ) : pilgrims.map((p, i) => {
                const ha = p.housing_assignments?.[0]
                const room = ha?.rooms
                const floor = room?.floors?.floor_number
                return (
                  <tr key={p.id} onClick={() => router.push(`/admin/pilgrims/${p.id}`)} className="border-b border-slate-100 hover:bg-emerald-50 cursor-pointer transition">
                    <td className="px-4 py-3 text-slate-400 text-xs">{page * PAGE_SIZE + i + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 hover:text-emerald-700">{p.full_name}</td>
                    <td className="px-4 py-3">
                      {p.groups?.group_number ? <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-xs font-bold border border-amber-200">{p.groups.group_number}</span> : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs max-w-[180px] truncate">{p.groups?.leader_name || '—'}</td>
                    <td className="px-4 py-3">
                      {floor ? <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-xs">{FLOOR_NAMES[String(floor)] || floor}</span> : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {room?.room_number ? <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">{room.room_number}</span> : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-sm border rounded disabled:opacity-40 hover:bg-white transition">السابق</button>
            <span className="text-xs text-slate-500">{page * PAGE_SIZE + 1} – {Math.min((page + 1) * PAGE_SIZE, total)} من {total}</span>
            <button disabled={(page + 1) * PAGE_SIZE >= total} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-sm border rounded disabled:opacity-40 hover:bg-white transition">التالي</button>
          </div>
        )}
      </div>
    </div>
  )
}
