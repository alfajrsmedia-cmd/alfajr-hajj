'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const FLOOR_NAMES: Record<number, string> = {
  1: 'الأول', 2: 'الثاني', 3: 'الثالث',
  4: 'الرابع', 5: 'الخامس', 6: 'السادس'
}

export default function SearchPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth')
    if (auth !== 'true') router.push('/admin/login')
  }, [router])

  async function doSearch() {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)

    const { data } = await supabase
      .from('pilgrims')
      .select(`id, full_name,
        groups(group_number, leader_name),
        housing_assignments(
          rooms(room_number, floors(floor_number))
        )`)
      .ilike('full_name', `%${query.trim()}%`)
      .limit(50)

    setResults(data || [])
    setLoading(false)
  }

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">🔍 البحث التفصيلي</h1>

      <div className="flex gap-3 mb-8">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doSearch()}
          placeholder="ابحث بالاسم..."
          className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
          autoFocus
        />
        <button
          onClick={doSearch}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition">
          {loading ? '...' : 'بحث'}
        </button>
      </div>

      {loading && (
        <div className="text-center py-12 text-slate-400">
          <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-3"></div>
          جاري البحث...
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          لا توجد نتائج لـ «{query}»
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500 mb-4">{results.length} نتيجة</p>
          {results.map(p => {
            const ha = p.housing_assignments?.[0]
            const room = ha?.rooms
            const floor = room?.floors?.floor_number
            return (
              <div key={p.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{p.full_name}</h3>
                    {p.groups?.leader_name && (
                      <p className="text-sm text-slate-500 mt-0.5">
                        مسؤول المجموعة: {p.groups.leader_name}
                      </p>
                    )}
                  </div>
                  {p.groups?.group_number && (
                    <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm font-bold border border-amber-200 flex-shrink-0">
                      مجموعة {p.groups.group_number}
                    </span>
                  )}
                </div>
                <div className="mt-4 flex gap-4 flex-wrap">
                  {floor && (
                    <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg">
                      <span className="text-purple-500">🏨</span>
                      <div>
                        <p className="text-xs text-slate-500">الدور</p>
                        <p className="font-semibold text-purple-800">{FLOOR_NAMES[floor] || floor}</p>
                      </div>
                    </div>
                  )}
                  {room?.room_number && (
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                      <span className="text-blue-500">🚪</span>
                      <div>
                        <p className="text-xs text-slate-500">الغرفة</p>
                        <p className="font-bold text-blue-800 text-lg">{room.room_number}</p>
                      </div>
                    </div>
                  )}
                  {!room && (
                    <div className="bg-orange-50 px-3 py-2 rounded-lg text-orange-700 text-sm">
                      لم يُحدد تسكين
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!searched && (
        <div className="text-center py-16 text-slate-300">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-slate-400">ابحث عن أي حاج بالاسم</p>
        </div>
      )}
    </div>
  )
}
