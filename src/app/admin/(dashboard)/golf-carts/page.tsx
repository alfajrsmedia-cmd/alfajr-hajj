"use client";
import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search } from "lucide-react";

const schedule = [
  { id: 1, date: '05/12/1447هـ', from: '12:00 ص', to: '3:00 ص',  count: 143, price: 300, total: 42900,  type: 'عربات كهربائية', extra: 15 },
  { id: 2, date: '07/12/1447هـ', from: '12:00 ص', to: '3:00 ص',  count: 134, price: 300, total: 40200,  type: 'عربات كهربائية', extra: 15 },
  { id: 3, date: '10/12/1447هـ', from: '1:00 ص',  to: '4:00 ص',  count: 300, price: 300, total: 90000,  type: 'عربات كهربائية', extra: 11 },
  { id: 4, date: '13/12/1447هـ', from: '4:00 م',  to: '7:00 م',  count: 15,  price: 200, total: 3000,   type: 'عربات كهربائية', extra: 0  },
  { id: 5, date: '13/12/1447هـ', from: '8:00 م',  to: '11:00 م', count: 285, price: 200, total: 57000,  type: 'عربات كهربائية', extra: 15 },
]

const TAB_COLORS: Record<string, string> = {
  'القدوم رحلة 1': 'emerald',
  'القدوم رحلة 2': 'blue',
  'القدوم التحاق': 'amber',
  'الافاضة':       'purple',
  'الوداع':        'rose',
  'العام':         'slate',
}

type Booking = {
  id: number
  full_name: string
  group_number: string | null
  national_id: string | null
  passport_number: string | null
  phone: string | null
  payment_method: string | null
  amount_paid: number | null
  program: string | null
  travel_date: string | null
  service_type: string | null
}

export default function GolfCartsPage() {
  const supabase = createClient()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('')
  const [search, setSearch] = useState('')

  const grandTotal = schedule.reduce((s, x) => s + x.total, 0)
  const totalExtra  = schedule.reduce((s, x) => s + x.extra, 0)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('golf_cart_bookings')
        .select('id,full_name,group_number,national_id,passport_number,phone,payment_method,amount_paid,program,travel_date,service_type')
        .order('id')
      if (data) {
        setBookings(data)
        const first = data[0]?.service_type ?? ''
        setActiveTab(first)
      }
      setLoading(false)
    }
    load()
  }, [])

  const tabs = useMemo(() => {
    const seen = new Set<string>()
    const order = ['القدوم رحلة 1','القدوم رحلة 2','القدوم التحاق','الافاضة','الوداع','العام']
    bookings.forEach(b => { if (b.service_type) seen.add(b.service_type) })
    const sorted = order.filter(t => seen.has(t))
    seen.forEach(t => { if (!sorted.includes(t)) sorted.push(t) })
    return sorted
  }, [bookings])

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    bookings.forEach(b => {
      if (b.service_type) c[b.service_type] = (c[b.service_type] ?? 0) + 1
    })
    return c
  }, [bookings])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return bookings.filter(b => {
      if (b.service_type !== activeTab) return false
      if (!q) return true
      return (
        b.full_name.toLowerCase().includes(q) ||
        (b.passport_number ?? '').toLowerCase().includes(q) ||
        (b.national_id ?? '').toLowerCase().includes(q) ||
        (b.phone ?? '').includes(q)
      )
    })
  }, [bookings, activeTab, search])

  return (
    <div className="p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">حجز عربات القولف</h1>
        <p className="text-slate-500 text-sm mt-1">مؤسسة فجر الامارات — عربات كهربائية</p>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
          <p className="text-3xl font-bold text-emerald-600">{bookings.length.toLocaleString()}</p>
          <p className="text-slate-500 text-sm mt-1">إجمالي الحجاج</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
          <p className="text-3xl font-bold text-blue-600">{grandTotal.toLocaleString()} ر.س</p>
          <p className="text-slate-500 text-sm mt-1">إجمالي المبلغ</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
          <p className="text-3xl font-bold text-amber-600">{totalExtra}</p>
          <p className="text-slate-500 text-sm mt-1">إجمالي الإضافي</p>
        </div>
      </div>

      {/* جدول الجدولة */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <h2 className="font-semibold text-slate-700 text-sm">جدول المواعيد والأسعار</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-emerald-600 text-white">
                <th className="px-4 py-3 text-right font-semibold">م</th>
                <th className="px-4 py-3 text-right font-semibold">التاريخ</th>
                <th className="px-4 py-3 text-right font-semibold">الوقت من</th>
                <th className="px-4 py-3 text-right font-semibold">الوقت إلى</th>
                <th className="px-4 py-3 text-right font-semibold">عدد الحجاج</th>
                <th className="px-4 py-3 text-right font-semibold">سعر الخدمة</th>
                <th className="px-4 py-3 text-right font-semibold">المجموع</th>
                <th className="px-4 py-3 text-right font-semibold">النوع</th>
                <th className="px-4 py-3 text-right font-semibold">الإضافي</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row, i) => (
                <tr key={row.id} className={`border-b border-slate-100 hover:bg-slate-50 transition ${i % 2 === 1 ? 'bg-slate-50/50' : ''}`}>
                  <td className="px-4 py-3 text-slate-400 text-xs">{row.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{row.date}</td>
                  <td className="px-4 py-3 text-slate-600">{row.from}</td>
                  <td className="px-4 py-3 text-slate-600">{row.to}</td>
                  <td className="px-4 py-3">
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-xs font-bold">
                      {row.count}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{row.price.toLocaleString()} ر.س</td>
                  <td className="px-4 py-3 font-bold text-slate-800">{row.total.toLocaleString()} ر.س</td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-xs font-medium">
                      {row.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-center">{row.extra}</td>
                </tr>
              ))}
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                <td colSpan={6} className="px-4 py-3 text-slate-700">الإجمالي</td>
                <td className="px-4 py-3 text-emerald-700 font-bold">{grandTotal.toLocaleString()} ر.س</td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3 text-slate-700 text-center font-bold">{totalExtra}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* قائمة الحجاج الديناميكية */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between gap-4 flex-wrap">
          <h2 className="font-semibold text-slate-700 text-sm">قائمة الحجاج المحجوزين</h2>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="بحث بالاسم أو الجواز أو الهوية..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pr-9 pl-4 py-1.5 border border-slate-200 rounded-lg text-sm w-72 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            />
          </div>
        </div>

        {/* التبويبات */}
        {!loading && (
          <div className="flex gap-1 px-4 pt-3 pb-0 overflow-x-auto">
            {tabs.map(tab => {
              const color = TAB_COLORS[tab] ?? 'slate'
              const isActive = tab === activeTab
              return (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setSearch('') }}
                  className={`px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap border-b-2 transition ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-500'
                      : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {tab}
                  <span className={`mr-1.5 text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {counts[tab] ?? 0}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-sm">جاري التحميل...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">لا توجد نتائج</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs">
                  <th className="px-3 py-2.5 text-right font-semibold">#</th>
                  <th className="px-3 py-2.5 text-right font-semibold">الاسم الكامل</th>
                  <th className="px-3 py-2.5 text-right font-semibold">المجموعة</th>
                  <th className="px-3 py-2.5 text-right font-semibold">رقم الجواز</th>
                  <th className="px-3 py-2.5 text-right font-semibold">رقم الهوية</th>
                  <th className="px-3 py-2.5 text-right font-semibold">الهاتف</th>
                  <th className="px-3 py-2.5 text-right font-semibold">طريقة السداد</th>
                  <th className="px-3 py-2.5 text-right font-semibold">المبلغ</th>
                  <th className="px-3 py-2.5 text-right font-semibold">البرنامج</th>
                  <th className="px-3 py-2.5 text-right font-semibold">تاريخ السفر</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => (
                  <tr key={b.id} className={`border-b border-slate-100 hover:bg-slate-50 transition ${i % 2 === 1 ? 'bg-slate-50/30' : ''}`}>
                    <td className="px-3 py-2.5 text-slate-400 text-xs">{i + 1}</td>
                    <td className="px-3 py-2.5 font-medium text-slate-800">{b.full_name}</td>
                    <td className="px-3 py-2.5 text-slate-500 text-xs">{b.group_number || '—'}</td>
                    <td className="px-3 py-2.5 text-slate-600 font-mono text-xs">{b.passport_number || '—'}</td>
                    <td className="px-3 py-2.5 text-slate-600 font-mono text-xs">{b.national_id || '—'}</td>
                    <td className="px-3 py-2.5 text-slate-600 text-xs" dir="ltr">{b.phone || '—'}</td>
                    <td className="px-3 py-2.5">
                      {b.payment_method ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                          b.payment_method.includes('تحويل')
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {b.payment_method.includes('تحويل') ? 'تحويل' : 'نقداً'}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-slate-700 font-bold text-xs">
                      {b.amount_paid ? `${b.amount_paid.toLocaleString()} ر.س` : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-slate-500 text-xs">{b.program || '—'}</td>
                    <td className="px-3 py-2.5 text-slate-500 text-xs">{b.travel_date || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400 text-left">
            {filtered.length} حاج{search ? ' (نتائج البحث)' : ''}
          </div>
        )}
      </div>
    </div>
  )
}
