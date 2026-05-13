'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function GroupsPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth')
    if (auth !== 'true') router.push('/admin/login')
    else loadGroups()
  }, [router])

  async function loadGroups() {
    setLoading(true)
    const { data } = await supabase
      .from('groups')
      .select(`id, group_number, leader_name,
        pilgrims(id, full_name,
          housing_assignments(rooms(room_number, floors(floor_number)))
        )`)
      .order('group_number')
    setGroups(data || [])
    setLoading(false)
  }

  const filtered = groups.filter(g => {
    if (!search) return true
    const q = search
    return (
      String(g.group_number).includes(q) ||
      g.leader_name?.includes(q)
    )
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-900">👥 المجموعات</h1>
        <div className="flex gap-3 items-center">
          <span className="text-sm text-slate-500">{groups.length} مجموعة</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث برقم المجموعة أو اسم المسؤول..."
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-3"></div>
            جاري التحميل...
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(g => {
            const count = g.pilgrims?.length || 0
            const isOpen = expanded === g.id

            // Get rooms for this group
            const rooms = new Set<string>()
            g.pilgrims?.forEach((p: any) => {
              const ha = p.housing_assignments?.[0]
              if (ha?.rooms?.room_number) {
                rooms.add(`${ha.rooms.floors?.floor_number}/${ha.rooms.room_number}`)
              }
            })

            return (
              <div key={g.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition">
                <div
                  className="px-4 py-4 cursor-pointer"
                  onClick={() => setExpanded(isOpen ? null : g.id)}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-amber-700 font-bold text-sm">{g.group_number}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm leading-snug">
                          {g.leader_name || 'لا يوجد اسم'}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          مجموعة رقم {g.group_number}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        {count} حاج
                      </span>
                      <span className="text-slate-400 text-xs">{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {rooms.size > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {[...rooms].slice(0, 6).map(r => (
                        <span key={r} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          غ{r.split('/')[1]}
                        </span>
                      ))}
                      {rooms.size > 6 && (
                        <span className="text-xs text-slate-400">+{rooms.size - 6}</span>
                      )}
                    </div>
                  )}
                </div>

                {isOpen && (
                  <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 max-h-64 overflow-y-auto">
                    {g.pilgrims?.map((p: any, i: number) => {
                      const room = p.housing_assignments?.[0]?.rooms
                      return (
                        <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                          <span className="text-sm text-slate-800">{p.full_name}</span>
                          {room && (
                            <span className="text-xs text-slate-500">
                              غرفة {room.room_number}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">لا توجد نتائج</div>
      )}
    </div>
  )
}
