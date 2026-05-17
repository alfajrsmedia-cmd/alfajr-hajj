'use client'

import { useState, useEffect, useMemo } from 'react'
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
  const [filter, setFilter] = useState<'all' | 'available' | 'full' | 'partial'>('all')
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

  const stats = useMemo(() => {
    const total = rooms.length
    const available = rooms.filter(r => (r.housing_assignments?.length || 0) === 0).length
    const full = rooms.filter(r => (r.housing_assignments?.length || 0) >= r.capacity).length
    const partial = total - available - full
    const totalCapacity = rooms.reduce((s, r) => s + (r.capacity || 0), 0)
    const totalPilgrims = rooms.reduce((s, r) => s + (r.housing_assignments?.length || 0), 0)
    const availableBeds = totalCapacity - totalPilgrims
    return { total, available, full, partial, totalCapacity, totalPilgrims, availableBeds }
  }, [rooms])

  const filteredRooms = useMemo(() => rooms.filter(r => {
    const occupants = r.housing_assignments?.length || 0
    if (filter === 'available' && occupants !== 0) return false
    if (filter === 'full' && occupants < r.capacity) return false
    if (filter === 'partial' && (occupants === 0 || occupants >= r.capacity)) return false
    if (!search) return true
    const q = search.toLowerCase()
    if (r.room_number.includes(q)) return true
    return r.housing_assignments?.some((ha: any) =>
      ha.pilgrims?.full_name?.includes(search) ||
      String(ha.pilgrims?.groups?.group_number).includes(q)
    )
  }), [rooms, search, filter])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-900">الأدوار والغرف</h1>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو رقم الغرفة..."
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-400" />
      </div>

      {/* إحصائيات الغرف */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
            <div className="text-xs text-slate-500 mt-1">إجمالي الغرف</div>
          </div>
          <div
            onClick={() => setFilter(filter === 'available' ? 'all' : 'available')}
            className={`rounded-xl border p-4 text-center shadow-sm cursor-pointer transition ${filter === 'available' ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-emerald-200 hover:border-emerald-400'}`}>
            <div className={`text-2xl font-bold ${filter === 'available' ? 'text-white' : 'text-emerald-600'}`}>{stats.available}</div>
            <div className={`text-xs mt-1 ${filter === 'available' ? 'text-emerald-100' : 'text-emerald-600'}`}>غرف متاحة</div>
          </div>
          <div
            onClick={() => setFilter(filter === 'partial' ? 'all' : 'partial')}
            className={`rounded-xl border p-4 text-center shadow-sm cursor-pointer transition ${filter === 'partial' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-blue-200 hover:border-blue-400'}`}>
            <div className={`text-2xl font-bold ${filter === 'partial' ? 'text-white' : 'text-blue-600'}`}>{stats.partial}</div>
            <div className={`text-xs mt-1 ${filter === 'partial' ? 'text-blue-100' : 'text-blue-600'}`}>غرف جزئية</div>
          </div>
          <div
            onClick={() => setFilter(filter === 'full' ? 'all' : 'full')}
            className={`rounded-xl border p-4 text-center shadow-sm cursor-pointer transition ${filter === 'full' ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white border-rose-200 hover:border-rose-400'}`}>
            <div className={`text-2xl font-bold ${filter === 'full' ? 'text-white' : 'text-rose-600'}`}>{stats.full}</div>
            <div className={`text-xs mt-1 ${filter === 'full' ? 'text-rose-100' : 'text-rose-600'}`}>غرف مكتملة</div>
          </div>
        </div>
      )}

      {/* شريط الأسرة المتاحة */}
      {!loading && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-5 flex flex-wrap gap-4 items-center text-sm">
          <span className="text-slate-600">الطاقة الإجمالية: <strong className="text-slate-800">{stats.totalCapacity}</strong> سرير</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-600">المشغولة: <strong className="text-slate-800">{stats.totalPilgrims}</strong></span>
          <span className="text-slate-400">|</span>
          <span className="text-emerald-700">الأسرة المتاحة: <strong className="text-emerald-800">{stats.availableBeds}</strong> سرير</span>
          {filter !== 'all' && (
            <button onClick={() => setFilter('all')} className="mr-auto text-xs px-3 py-1 rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-100 transition">✕ مسح الفلتر</button>
          )}
        </div>
      )}

      {/* أزرار الأدوار */}
      <div className="flex gap-2 flex-wrap mb-5">
        {[1,2,3,4,5,6].map(f => (
          <button key={f} onClick={() => setSelectedFloor(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition border ${
              selectedFloor === f ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'}`}>
            الدور {FLOOR_NAMES[f]}
          </button>
        ))}
      </div>

      <div className="text-sm text-slate-500 mb-3">{filteredRooms.length} غرفة</div>

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
            const isEmpty = occupants.length === 0
            return (
              <div key={room.id} className={`bg-white rounded-xl border overflow-hidden shadow-sm transition hover:shadow-md ${
                isFull ? 'border-rose-200' : isEmpty ? 'border-emerald-200' : 'border-blue-100'
              }`}>
                <div className={`px-4 py-3 flex items-center justify-between border-b ${
                  isFull ? 'bg-rose-50 border-rose-100' : isEmpty ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'
                }`}>
                  <span className={`text-xl font-bold ${isFull ? 'text-rose-700' : isEmpty ? 'text-emerald-700' : 'text-blue-700'}`}>{room.room_number}</span>
                  <div className="flex items-center gap-2">
                    {isEmpty && <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">متاحة</span>}
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      isFull ? 'bg-rose-100 text-rose-700' : isEmpty ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-600'
                    }`}>{occupants.length} / {room.capacity}</span>
                  </div>
                </div>
                <div className="p-2 min-h-[60px]">
                  {occupants.length === 0 ? (
                    <p className="text-xs text-emerald-400 text-center py-4">🟢 غرفة متاحة</p>
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
      {!loading && filteredRooms.length === 0 && <div className="text-center py-16 text-slate-400">لا توجد نتائج</div>}
    </div>
  )
}
