export default function GolfCartsPage() {
  const schedule = [
    { id: 1, date: '05/12/1447هـ', from: '12:00 ص', to: '3:00 ص',  count: 143, price: 300, total: 42900,  type: 'عربات كهربائية', extra: 15 },
    { id: 2, date: '07/12/1447هـ', from: '12:00 ص', to: '3:00 ص',  count: 134, price: 300, total: 40200,  type: 'عربات كهربائية', extra: 15 },
    { id: 3, date: '10/12/1447هـ', from: '1:00 ص',  to: '4:00 ص',  count: 300, price: 300, total: 90000,  type: 'عربات كهربائية', extra: 11 },
    { id: 4, date: '13/12/1447هـ', from: '4:00 م',  to: '7:00 م',  count: 15,  price: 200, total: 3000,   type: 'عربات كهربائية', extra: 0  },
    { id: 5, date: '13/12/1447هـ', from: '8:00 م',  to: '11:00 م', count: 285, price: 200, total: 57000,  type: 'عربات كهربائية', extra: 15 },
  ]

  const services = [
    { name: 'القدوم رحلة 1', count: 112, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { name: 'القدوم رحلة 2', count: 119, color: 'bg-blue-50 text-blue-700 border-blue-200'           },
    { name: 'القدوم التحاق', count: 16,  color: 'bg-amber-50 text-amber-700 border-amber-200'         },
    { name: 'الافاضة',       count: 289, color: 'bg-purple-50 text-purple-700 border-purple-200'      },
    { name: 'الوداع',        count: 283, color: 'bg-rose-50 text-rose-700 border-rose-200'             },
  ]

  const totalPilgrims = services.reduce((s, x) => s + x.count, 0)
  const grandTotal = schedule.reduce((s, x) => s + x.total, 0)
  const totalExtra  = schedule.reduce((s, x) => s + x.extra, 0)

  return (
    <div className="p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">حجز عربات القولف</h1>
        <p className="text-slate-500 text-sm mt-1">مؤسسة فجر الامارات — عربات كهربائية</p>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
          <p className="text-3xl font-bold text-emerald-600">{totalPilgrims.toLocaleString()}</p>
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

      {/* توزيع الخدمات */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <h2 className="font-semibold text-slate-700 text-sm">توزيع الحجاج على الخدمات</h2>
        </div>
        <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-3">
          {services.map(s => (
            <div key={s.name} className={`flex items-center justify-between px-4 py-3 rounded-lg border ${s.color}`}>
              <span className="text-sm font-medium">{s.name}</span>
              <span className="text-lg font-bold">{s.count}</span>
            </div>
          ))}
          <div className="flex items-center justify-between px-4 py-3 rounded-lg border bg-slate-800 text-white">
            <span className="text-sm font-medium">المجموع الكلي</span>
            <span className="text-lg font-bold">{totalPilgrims}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
