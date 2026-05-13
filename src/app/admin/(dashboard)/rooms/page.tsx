'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const FLOOR_NAMES: Record<number, string> = {
  1: 'الأول', 2: 'الثاني', 3: 'الثالث',
  4: 'الرابع', 5: 'الخامس', 6: 'السادس'
}

export default function FloorsPage() {
  const [selectedFloor, setSelectedFloor] = useState(1)
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => { loadRooms(selectedFloor) }, [selectedFloor])

  async function loadRooms(floor: number) {
    setLoading(true)
    const { data: floorData } = await supabase
      .from('floors').select('id').eq('floor_number', floor).single()
    if (!floorData) { setLoading(false); return }
    const { data } = await supabase
      .from('rooms')
      .select(`id, room_number, capacity, housing_assignments(pilgrim_id, pilgrims(full_name, groups(group_number)))`)
      .eq('floor_id', floorData.id)
      .order('room_number')
    setRooms(data || [])
    setLoading(false)
  }

  const filteredRooms = rooms.filter(r => {
    if (!search) return true
    const q = search.toLowerCase()
    if (r.room_number.includes(q)) return true
    return r.housing_assignments?.some((ha: any) =>
      ha.pilgrims?.full_name?.includes(search) ||
      String(ha.pilgrims?.groups?.group_number).includes(q)
    )
  })

  const totalPilgrims = rooms.reduce((s, r) => s + (r.housing_assignments?.length || 0), 0)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-900">الادوار والغرف</h1>
        <div className="flex gap-3 items-center">
          <span className="text-sm text-slate-500">{rooms.length} غرفة · {totalPilgrims} حاج</span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="بحث بالاسم او رقم الغرفة..."
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
      </div>
      <div className="flex gap-2 flex-wrap mb-6">
        {[1,2,3,4,5,6].map(f => (
          <button key={f} onClick={() => setSelectedFloor(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
              selectedFloor === f ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'}`}>
            الدور {FLOOR_NAMES[f]}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-3"></div>
            جاري تحميل الغرف...
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRooms.map(room => {
            const occupants = room.housing_assignments || []
            const isFull = occupants.length >= room.capacity
            return (
              <div key={room.id} className={`bg-white rounded-xl border overflow-hidden shadow-sm transition hover:shadow-md ${isFull ? 'border-green-200' : occupants.length === 0 ? 'border-slate-100' : 'border-blue-100'}`}>
                <div className={`px-4 py-3 flex items-center justify-between border-b ${isFull ? 'bg-green-50 border-green-100' : occupants.length === 0 ? 'bg-slate-50 border-slate-100' : 'bg-blue-50 border-blue-100'}`}>
                  <span className={`text-xl font-bold ${isFull ? 'text-green-700' : 'text-blue-700'}`}>{room.room_number}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${isFull ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-600'}`}>{occupants.length} / {room.capacity}</span>
                </div>
                <div className="p-2 min-h-[60px]">
                  {occupants.length === 0 ? (
                    <p className="text-xs text-slate-300 text-center py-4">غرفة فارغة</p>
                  ) : (
                    occupants.map((ha: any, i: number) => (
                      <div key={i} className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-slate-50 gap-2">
                        <span className="text-sm text-slate-800 truncate flex-1">{ha.pilgrims?.full_name}</span>
                        {ha.pilgrims?.groups?.group_number && (
                          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full flex-shrink-0 border border-amber-200">{ha.pilgrims.groups.group_number}</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
      {!loading && filteredRooms.length === 0 && <div className="text-center py-16 text-slate-400">لا توجد نتائج للبحث</div>}
    </div>
  )
}
