'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const LEVEL_COLORS: Record<string, string> = {
  'المستوى الأول': 'bg-purple-100 text-purple-700 border-purple-200',
  'المستوى الثاني': 'bg-blue-100 text-blue-700 border-blue-200',
  'المستوى الثالث': 'bg-green-100 text-green-700 border-green-200',
  'المستوى الرابع': 'bg-amber-100 text-amber-700 border-amber-200',
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<string[]>([])
  const [selectedProgram, setSelectedProgram] = useState('')
  const [pilgrims, setPilgrims] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roomTypeFilter, setRoomTypeFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [counts, setCounts] = useState<Record<string, number>>({})
  const supabase = createClient()

  useEffect(() => { loadPrograms() }, [])
  useEffect(() => { if (selectedProgram) loadPilgrims() }, [selectedProgram])

  async function loadPrograms() {
    const { data } = await supabase.from('pilgrims').select('program')
    if (data) {
      const c: Record<string, number> = {}
      data.forEach((p: any) => { if (p.program) c[p.program] = (c[p.program] || 0) + 1 })
      setCounts(c)
      const list = Object.keys(c).sort()
      setPrograms(list)
      if (list.length > 0) setSelectedProgram(list[0])
    }
  }

  async function loadPilgrims() {
    setLoading(true)
    setRoomTypeFilter('')
    setLevelFilter('')
    setSearch('')
    const { data } = await supabase
      .from('pilgrims')
      .select(`id, full_name, program, room_type, level, travel_from, travel_to,
        groups(group_number, leader_name),
        housing_assignments(rooms(room_number))`)
      .eq('program', selectedProgram)
      .order('full_name')
    setPilgrims(data || [])
    setLoading(false)
  }

  const filtered = pilgrims.filter(p => {
    if (search && !p.full_name?.includes(search) && !p.groups?.leader_name?.includes(search)) return false
    if (roomTypeFilter && p.room_type !== roomTypeFilter) return false
    if (levelFilter && p.level !== levelFilter) return false
    return true
  })

  // إحصائيات نوع الغرفة
  const roomStats = pilgrims.reduce((acc: any, p) => {
    const t = p.room_type
    if (t) acc[t] = (acc[t] || 0) + 1
    return acc
  }, {})

  // إحصائيات المستوى
  const levelStats = pilgrims.reduce((acc: any, p) => {
    const l = p.level
    if (l) acc[l] = (acc[l] || 0) + 1
    return acc
  }, {})

  // تواريخ السفر الفريدة
  const travelDates = [...new Set(pilgrims
    .filter(p => p.travel_from && p.travel_to)
    .map(p => `${p.travel_from} ← ${p.travel_to}`)
  )]

  function exportCSV() {
    const rows = [
      ['#', 'اسم الحاج', 'المجموعة', 'مسؤول المجموعة', 'نوع الغرفة', 'المستوى', 'الغرفة', 'السفر من', 'إلى'],
      ...filtered.map((p, i) => [
        i + 1, p.full_name,
        p.groups?.group_number || '',
        p.groups?.leader_name || '',
        p.room_type || '',
        p.level || '',
        p.housing_assignments?.[0]?.rooms?.room_number || '',
        p.travel_from || '',
        p.travel_to || '',
      ])
    ].map(r => r.join(',')).join('\n')
    const blob = new Blob(['\ufeff' + rows], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${selectedProgram}.csv`
    a.click()
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-900">✈️ البرامج</h1>
      </div>

      {/* Program tabs */}
      <div className="flex gap-2 flex-wrap mb-5">
        {programs.map(p => (
          <button key={p} onClick={() => setSelectedProgram(p)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition border flex items-center gap-2 ${
              selectedProgram === p
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-600 border-slate-300 hover:border-emerald-400'
            }`}>
            ✈️ {p}
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              selectedProgram === p ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
            }`}>{counts[p] || 0}</span>
          </button>
        ))}
      </div>

      {/* Filter row 1: search + room type dropdown + export */}
      <div className="flex gap-3 mb-3 flex-wrap items-center bg-white border border-slate-200 rounded-xl px-4 py-3">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="ابحث باسم الحاج أو المسؤول..."
          className="flex-1 min-w-[200px] px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        <select value={roomTypeFilter} onChange={e => setRoomTypeFilter(e.target.value)}
          className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none">
          <option value="">كل أنواع الغرف</option>
          {Object.keys(roomStats).map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <span className="text-sm text-slate-500 font-medium">{filtered.length} حاج</span>
        <button onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-1.5 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700 transition">
          ⬇ تصدير
        </button>
      </div>

      {/* Filter row 2: room type stats + level filters + travel date */}
      <div className="flex gap-2 flex-wrap mb-4 items-center bg-white border border-slate-200 rounded-xl px-4 py-3">
        {/* Room type buttons */}
        {Object.entries(roomStats).map(([type, count]: any) => (
          <button key={type}
            onClick={() => setRoomTypeFilter(roomTypeFilter === type ? '' : type)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              roomTypeFilter === type
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-700 border-slate-300 hover:border-slate-500'
            }`}>
            <span className="font-bold">{count}</span>
            <span>{type}</span>
          </button>
        ))}

        <div className="w-px h-5 bg-slate-200 mx-1"></div>

        {/* Level buttons */}
        {Object.entries(levelStats).map(([level, count]: any) => (
          <button key={level}
            onClick={() => setLevelFilter(levelFilter === level ? '' : level)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              levelFilter === level
                ? `${LEVEL_COLORS[level] || 'bg-slate-100 text-slate-700'} ring-2 ring-offset-1 ring-current`
                : `${LEVEL_COLORS[level] || 'bg-white text-slate-600 border-slate-200'}`
            }`}>
            🏨 {level}
          </button>
        ))}

        {/* Travel dates */}
        {travelDates.length > 0 && (
          <>
            <div className="w-px h-5 bg-slate-200 mx-1"></div>
            {travelDates.map(d => (
              <span key={d} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-slate-50 border border-slate-200 text-slate-600">
                📅 {d}
              </span>
            ))}
          </>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-right px-3 py-3 font-semibold text-slate-600 w-10">#</th>
                <th className="text-right px-3 py-3 font-semibold text-slate-600">اسم الحاج</th>
                <th className="text-right px-3 py-3 font-semibold text-slate-600">المجموعة</th>
                <th className="text-right px-3 py-3 font-semibold text-slate-600">مسؤول المجموعة</th>
                <th className="text-right px-3 py-3 font-semibold text-slate-600">نوع الغرفة</th>
                <th className="text-right px-3 py-3 font-semibold text-slate-600">المستوى</th>
                <th className="text-right px-3 py-3 font-semibold text-slate-600">الغرفة</th>
                <th className="text-right px-3 py-3 font-semibold text-slate-600">السفر من</th>
                <th className="text-right px-3 py-3 font-semibold text-slate-600">إلى</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-16 text-slate-400">
                  <div className="animate-spin w-7 h-7 border-2 border-emerald-400 border-t-transparent rounded-full mx-auto mb-3"></div>
                  جاري التحميل...
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-16 text-slate-400">لا توجد نتائج</td></tr>
              ) : filtered.map((p, i) => {
                const room = p.housing_assignments?.[0]?.rooms
                return (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="px-3 py-2.5 text-slate-400 text-xs">{i + 1}</td>
                    <td className="px-3 py-2.5 font-medium text-slate-900">{p.full_name}</td>
                    <td className="px-3 py-2.5">
                      {p.groups?.group_number
                        ? <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-xs font-bold border border-amber-200">م {p.groups.group_number}</span>
                        : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 text-xs max-w-[160px] truncate">{p.groups?.leader_name || '—'}</td>
                    <td className="px-3 py-2.5">
                      {p.room_type
                        ? <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">{p.room_type}</span>
                        : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-3 py-2.5">
                      {p.level
                        ? <span className={`px-2 py-0.5 rounded text-xs font-medium border ${LEVEL_COLORS[p.level] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>{p.level}</span>
                        : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-3 py-2.5">
                      {room?.room_number
                        ? <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">{room.room_number}</span>
                        : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-slate-500 text-xs whitespace-nowrap">{p.travel_from || '—'}</td>
                    <td className="px-3 py-2.5 text-slate-500 text-xs whitespace-nowrap">{p.travel_to || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
