'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

const PROGRAMS = [
  'الرحلة الأولى 1447',
  'الرحلة الثانية 1447',
  'الالتحاق 1447',
  'الرحلة الأولى — بزنس',
  'الرحلة الثانية — بزنس',
]

export default function ProgramsPage() {
  const [selectedProgram, setSelectedProgram] = useState(PROGRAMS[0])
  const [pilgrims, setPilgrims] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [counts, setCounts] = useState<Record<string, number>>({})
  const supabase = createClient()

  useEffect(() => { loadCounts() }, [])
  useEffect(() => { loadPilgrims() }, [selectedProgram])

  async function loadCounts() {
    const { data } = await supabase
      .from('pilgrims')
      .select('program')
    if (data) {
      const c: Record<string, number> = {}
      data.forEach((p: any) => { c[p.program] = (c[p.program] || 0) + 1 })
      setCounts(c)
    }
  }

  async function loadPilgrims() {
    setLoading(true)
    const { data } = await supabase
      .from('pilgrims')
      .select(`id, full_name, program, room_type, level, travel_from, travel_to,
        groups(group_number, leader_name),
        housing_assignments(rooms(room_number, floors(floor_number)))`)
      .eq('program', selectedProgram)
      .order('full_name')
    setPilgrims(data || [])
    setLoading(false)
  }

  const filtered = pilgrims.filter(p =>
    !search || p.full_name?.includes(search) || p.groups?.leader_name?.includes(search)
  )

  // إحصائيات نوع الغرفة
  const roomTypeStats = filtered.reduce((acc: any, p) => {
    const t = p.room_type || 'غير محدد'
    acc[t] = (acc[t] || 0) + 1
    return acc
  }, {})

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">البرامج</h1>

      {/* Program tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {PROGRAMS.map(p => (
          <button key={p}
            onClick={() => setSelectedProgram(p)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition border flex items-center gap-2 ${
              selectedProgram === p
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
            }`}>
            {p}
            {counts[p] && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                selectedProgram === p ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
              }`}>{counts[p]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="flex gap-3 flex-wrap mb-5">
        {Object.entries(roomTypeStats).map(([type, count]: any) => (
          <div key={type} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm flex items-center gap-2">
            <span className="text-slate-500">نوع {type}</span>
            <span className="font-bold text-slate-900">{count}</span>
          </div>
        ))}
        <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm flex items-center gap-2">
          <span className="text-slate-500">الإجمالي</span>
          <span className="font-bold text-blue-600">{filtered.length}</span>
        </div>
      </div>

      {/* Search and export */}
      <div className="flex gap-3 mb-4 flex-wrap items-center">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ابحث باسم الحاج أو المسؤول..."
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm flex-1 max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={() => {
            const csv = [
              ['#', 'اسم الحاج', 'المجموعة', 'المسؤول', 'نوع الغرفة', 'المستوى', 'الغرفة', 'السفر من', 'إلى'],
              ...filtered.map((p, i) => [
                i + 1,
                p.full_name,
                p.groups?.group_number || '',
                p.groups?.leader_name || '',
                p.room_type || '',
                p.level || '',
                p.housing_assignments?.[0]?.rooms?.room_number || '',
                p.travel_from || '',
                p.travel_to || '',
              ])
            ].map(r => r.join(',')).join('\n')
            const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${selectedProgram}.csv`
            a.click()
          }}
          className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 transition flex items-center gap-2">
          ⬇ تصدير
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-right px-4 py-3 font-semibold text-slate-700">#</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-700">اسم الحاج</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-700">المجموعة</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-700">مسؤول المجموعة</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-700">نوع الغرفة</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-700">المستوى</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-700">الغرفة</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-700">السفر من</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-700">إلى</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-12 text-slate-400">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-2"></div>
                  جاري التحميل...
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-slate-400">لا توجد نتائج</td></tr>
              ) : filtered.map((p, i) => {
                const room = p.housing_assignments?.[0]?.rooms
                const levelColor: any = {
                  'المستوى الأول': 'bg-purple-50 text-purple-700',
                  'المستوى الثاني': 'bg-blue-50 text-blue-700',
                  'المستوى الثالث': 'bg-green-50 text-green-700',
                  'المستوى الرابع': 'bg-amber-50 text-amber-700',
                }
                return (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-slate-400 text-xs">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{p.full_name}</td>
                    <td className="px-4 py-3">
                      {p.groups?.group_number ? (
                        <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-xs font-bold border border-amber-200">
                          م {p.groups.group_number}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs max-w-[160px] truncate">{p.groups?.leader_name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">{p.room_type || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      {p.level ? (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${levelColor[p.level] || 'bg-slate-100 text-slate-700'}`}>
                          {p.level}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {room?.room_number ? (
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">{room.room_number}</span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{p.travel_from || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{p.travel_to || '—'}</td>
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
