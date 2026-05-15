export default function QuantitiesPage() {
  const vehicles = [
    { id: 1, date: '06/12/1447هـ', from: '12 ص', to: '3 ص',  count: 100, type: 'عربات يدوية' },
    { id: 2, date: '10/12/1447هـ', from: '1 ص',  to: '4 ص',  count: 100, type: 'عربات يدوية' },
    { id: 3, date: '13/12/1447هـ', from: '4 م',  to: '7 م',  count: 100, type: 'عربات يدوية' },
    { id: 4, date: '06/12/1447هـ', from: '12 ص', to: '3 ص',  count: 30,  type: 'عربات كهربائية' },
    { id: 5, date: '10/12/1447هـ', from: '1 ص',  to: '4 ص',  count: 30,  type: 'عربات كهربائية' },
    { id: 6, date: '13/12/1447هـ', from: '4 م',  to: '7 م',  count: 30,  type: 'عربات كهربائية' },
  ]

  const shifts = [
    { id: 1, date: '06/12/1447هـ', hours: 'من 12 ص الى 8 ص',   shift: 'الأولى'  },
    { id: 2, date: '10/12/1447هـ', hours: 'من 12 ص الى 8 ص',   shift: 'الأولى'  },
    { id: 3, date: '13/12/1447هـ', hours: 'من 4 م إلى 12 ص', shift: 'الثالثة' },
  ]

  return (
    <div className="p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">جدول الكميات والمواعيد</h1>
        <p className="text-slate-500 text-sm mt-1">العربات الكهربائية واليدوية بدافع</p>
      </div>

      {/* جدول العربات */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <h2 className="font-semibold text-slate-700 text-sm">جدول العربات (يدوية وكهربائية)</h2>
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
                <th className="px-4 py-3 text-right font-semibold">النوع</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((row, i) => (
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
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                      row.type === 'عربات كهربائية'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {row.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* جدول الورديات */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <h2 className="font-semibold text-slate-700 text-sm">جدول الورديات</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-700 text-white">
                <th className="px-4 py-3 text-right font-semibold">م</th>
                <th className="px-4 py-3 text-right font-semibold">التاريخ</th>
                <th className="px-4 py-3 text-right font-semibold">مواعيد العمل</th>
                <th className="px-4 py-3 text-right font-semibold">الوردية</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((row, i) => (
                <tr key={row.id} className={`border-b border-slate-100 hover:bg-slate-50 transition ${i % 2 === 1 ? 'bg-slate-50/50' : ''}`}>
                  <td className="px-4 py-3 text-slate-400 text-xs">{row.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{row.date}</td>
                  <td className="px-4 py-3 text-slate-600">{row.hours}</td>
                  <td className="px-4 py-3">
                    <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded text-xs font-medium">
                      {row.shift}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
