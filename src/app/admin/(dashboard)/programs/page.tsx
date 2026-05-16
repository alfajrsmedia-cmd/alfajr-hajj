'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Program { id: number; name: string }
interface Pilgrim {
  id: number
  full_name: string
  english_name: string | null
  passport_number: string | null
  permit_number: number | null
  gender: string | null
  nationality: string | null
  role: string | null
  program_id: number | null
  groups: { group_number: number; leader_name: string | null } | null
  housing_assignments: { rooms: { room_number: string } | null }[]
}

const GENDER_LABEL: Record<string, string> = { male: 'ذكر', female: 'أنثى' }

export default function ProgramsPage() {
  const [programsList, setProgramsList] = useState<Program[]>([])
  const [selectedProgram, setSelectedProgram] = useState<number | null>(null)
  const [pilgrims, setPilgrims] = useState<Pilgrim[]>([])
  const [counts, setCounts] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [genderFilter, setGenderFilter] = useState('')
  const [groupFilter, setGroupFilter] = useState('')
  const [nationalityFilter, setNationalityFilter] = useState('')
  const supabase = createClient()

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [{ data: progs }, { data: pils }] = await Promise.all([
      supabase.from('programs').select('id, name').order('id'),
      supabase
        .from('pilgrims')
        .select(`id, full_name, english_name, passport_number, permit_number, gender, nationality, role, program_id,
          groups(group_number, leader_name),
          housing_assignments(rooms(room_number))`)
        .order('full_name'),
    ])
    if (progs) setProgramsList(progs)
    if (pils) {
      setPilgrims(pils as any)
      const c: Record<number, number> = {}
      pils.forEach((p: any) => { if (p.program_id) c[p.program_id] = (c[p.program_id] || 0) + 1 })
      setCounts(c)
      if (progs && progs.length > 0) setSelectedProgram(progs[0].id)
    }
    setLoading(false)
  }

  const programPilgrims = useMemo(
    () => pilgrims.filter(p => p.program_id === selectedProgram),
    [pilgrims, selectedProgram]
  )

  const nationalities = useMemo(
    () => [...new Set(programPilgrims.map(p => p.nationality).filter(Boolean))].sort() as string[],
    [programPilgrims]
  )

  const groups = useMemo(
    () => [...new Set(programPilgrims.map(p => p.groups?.group_number).filter(Boolean))].sort((a, b) => (a as number) - (b as number)) as number[],
    [programPilgrims]
  )

  const filtered = useMemo(() => programPilgrims.filter(p => {
    if (search) {
      const q = search.toLowerCase()
      const match =
        p.full_name?.toLowerCase().includes(q) ||
        p.english_name?.toLowerCase().includes(q) ||
        p.passport_number?.toLowerCase().includes(q) ||
        String(p.permit_number || '').includes(q)
      if (!match) return false
    }
    if (genderFilter && p.gender !== genderFilter) return false
    if (groupFilter && String(p.groups?.group_number) !== groupFilter) return false
    if (nationalityFilter && p.nationality !== nationalityFilter) return false
    return true
  }), [programPilgrims, search, genderFilter, groupFilter, nationalityFilter])

  function resetFilters() {
    setSearch('')
    setGenderFilter('')
    setGroupFilter('')
    setNationalityFilter('')
  }

  function selectProgram(id: number) {
    setSelectedProgram(id)
    resetFilters()
  }

  function exportCSV() {
    const prog = programsList.find(p => p.id === selectedProgram)?.name || ''
    const rows = [
      ['#', 'اسم الحاج', 'الاسم بالإنجليزية', 'رقم الجواز', 'رقم التصريح', 'الجنس', 'المجموعة', 'مسؤول المجموعة', 'الدور', 'الغرفة', 'الجنسية'],
      ...filtered.map((p, i) => [
        i + 1,
        p.full_name,
        p.english_name || '',
        p.passport_number || '',
        p.permit_number || '',
        GENDER_LABEL[p.gender || ''] || p.gender || '',
        p.groups?.group_number || '',
        p.groups?.leader_name || '',
        p.role || '',
        p.housing_assignments?.[0]?.rooms?.room_number || '',
        p.nationality || '',
      ])
    ].map(r => r.join(',')).join('\n')
    const blob = new Blob(['﻿' + rows], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${prog}.csv`
    a.click()
  }

  const genderStats = useMemo(() => programPilgrims.reduce((acc: Record<string, number>, p) => {
    if (p.gender) acc[p.gender] = (acc[p.gender] || 0) + 1
    return acc
  }, {}), [programPilgrims])

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-slate-900">✈️ البرامج</h1>
      </div>

      {/* Program tabs */}
      <div className="flex gap-2 flex-wrap mb-5">
        {loading && programsList.length === 0 ? (
          <div className="text-slate-400 text-sm">جاري التحميل...</div>
        ) : programsList.map(prog => (
          <button key={prog.id} onClick={() => selectProgram(prog.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition border flex items-center gap-2 ${
              selectedProgram === prog.id
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-600 border-slate-300 hover:border-emerald-400'
            }`}>
            ✈️ {prog.name}
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              selectedProgram === prog.id ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
            }`}>{counts[prog.id] || 0}</span>
          </button>
        ))}
      </div>

      {/* Search + filters + export */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 mb-3 flex gap-3 flex-wrap items-center">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="ابحث بالاسم أو رقم الجواز أو رقم التصريح..."
          className="flex-1 min-w-[220px] px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />

        <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)}
          className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none">
          <option value="">كل الجنسين</option>
          <option value="male">ذكر</option>
          <option value="female">أنثى</option>
        </select>

        <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)}
          className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none">
          <option value="">كل المجموعات</option>
          {groups.map(g => <option key={g} value={String(g)}>م {g}</option>)}
        </select>

        <select value={nationalityFilter} onChange={e => setNationalityFilter(e.target.value)}
          className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none">
          <option value="">كل الجنسيات</option>
          {nationalities.map(n => <option key={n} value={n}>{n}</option>)}
        </select>

        <span className="text-sm text-slate-500 font-medium">{filtered.length} حاج</span>

        {(search || genderFilter || groupFilter || nationalityFilter) && (
          <button onClick={resetFilters}
            className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition">
            ✕ مسح
          </button>
        )}

        <button onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-1.5 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700 transition">
          ⬇ تصدير
        </button>
      </div>

      {/* Gender stats chips */}
      {!loading && selectedProgram && (
        <div className="flex gap-2 flex-wrap mb-4 items-center">
          {Object.entries(genderStats).map(([g, cnt]) => (
            <button key={g} onClick={() => setGenderFilter(genderFilter === g ? '' : g)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                genderFilter === g
                  ? g === 'male'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-rose-500 text-white border-rose-500'
                  : g === 'male'
                    ? 'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-400'
                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:border-rose-400'
              }`}>
              {g === 'male' ? '👤' : '👤'} {GENDER_LABEL[g] || g}
              <span className="font-bold">{cnt}</span>
            </button>
          ))}
          <span className="text-xs text-slate-400 mr-1">
            إجمالي البرنامج: <strong className="text-slate-600">{counts[selectedProgram!] || 0}</strong> حاج
          </span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-right px-3 py-3 font-semibold text-slate-600 w-10">#</th>
                <th className="text-right px-3 py-3 font-semibold text-slate-600">اسم الحاج</th>
                <th className="text-right px-3 py-3 font-semibold text-slate-600">الاسم بالإنجليزية</th>
                <th className="text-right px-3 py-3 font-semibold text-slate-600">رقم الجواز</th>
                <th className="text-right px-3 py-3 font-semibold text-slate-600">رقم التصريح</th>
                <th className="text-right px-3 py-3 font-semibold text-slate-600">الجنس</th>
                <th className="text-right px-3 py-3 font-semibold text-slate-600">المجموعة</th>
                <th className="text-right px-3 py-3 font-semibold text-slate-600">مسؤول المجموعة</th>
                <th className="text-right px-3 py-3 font-semibold text-slate-600">الدور</th>
                <th className="text-right px-3 py-3 font-semibold text-slate-600">الغرفة</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} className="text-center py-16 text-slate-400">
                  <div className="animate-spin w-7 h-7 border-2 border-emerald-400 border-t-transparent rounded-full mx-auto mb-3"></div>
                  جاري التحميل...
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-16 text-slate-400">لا توجد نتائج</td></tr>
              ) : filtered.map((p, i) => {
                const room = p.housing_assignments?.[0]?.rooms
                return (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="px-3 py-2.5 text-slate-400 text-xs">{i + 1}</td>
                    <td className="px-3 py-2.5 font-medium text-slate-900">{p.full_name}</td>
                    <td className="px-3 py-2.5 text-slate-500 text-xs">{p.english_name || <span className="text-slate-300">—</span>}</td>
                    <td className="px-3 py-2.5">
                      {p.passport_number
                        ? <span className="font-mono text-xs text-slate-700">{p.passport_number}</span>
                        : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-3 py-2.5">
                      {p.permit_number
                        ? <span className="font-mono text-xs text-slate-700">{p.permit_number}</span>
                        : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-3 py-2.5">
                      {p.gender
                        ? <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                            p.gender === 'male'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>{GENDER_LABEL[p.gender] || p.gender}</span>
                        : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-3 py-2.5">
                      {p.groups?.group_number
                        ? <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-xs font-bold border border-amber-200">م {p.groups.group_number}</span>
                        : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 text-xs max-w-[160px] truncate">{p.groups?.leader_name || '—'}</td>
                    <td className="px-3 py-2.5 text-slate-600 text-xs">{p.role || <span className="text-slate-300">—</span>}</td>
                    <td className="px-3 py-2.5">
                      {room?.room_number
                        ? <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">{room.room_number}</span>
                        : <span className="text-slate-300 text-xs">—</span>}
                    </td>
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
