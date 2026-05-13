import { createClient } from "@/lib/supabase/server";
import { TableProperties } from "lucide-react";

export default async function FinalTablePage() {
  const supabase = await createClient();

  const { data: pilgrims } = await supabase
    .from("pilgrims")
    .select("program, gender, room_type, level");

  const programs = [...new Set((pilgrims || []).map((p: any) => p.program))].filter(Boolean);

  const rows = programs.map((program) => {
    const group = (pilgrims || []).filter((p: any) => p.program === program);
    const males = group.filter((p: any) => p.gender === "male").length;
    const females = group.filter((p: any) => p.gender === "female").length;
    const total = group.length;
    return { program, males, females, total };
  });

  const totals = rows.reduce(
    (acc, r) => ({
      males: acc.males + r.males,
      females: acc.females + r.females,
      total: acc.total + r.total,
    }),
    { males: 0, females: 0, total: 0 }
  );

  return (
    <div>
      <header className="mb-6 flex items-center gap-2">
        <TableProperties className="w-6 h-6 text-slate-600" />
        <h1 className="text-2xl font-bold text-slate-900">الجدول النهائي</h1>
      </header>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700">البرنامج</th>
                <th className="px-6 py-4 font-semibold text-slate-700">رجال</th>
                <th className="px-6 py-4 font-semibold text-slate-700">نساء</th>
                <th className="px-6 py-4 font-semibold text-emerald-700">المجموع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((r) => (
                <tr key={r.program} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium text-slate-800">{r.program}</td>
                  <td className="px-6 py-4 text-slate-600">{r.males || "—"}</td>
                  <td className="px-6 py-4 text-slate-600">{r.females || "—"}</td>
                  <td className="px-6 py-4 font-bold text-emerald-700">{r.total}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 border-t-2 border-slate-200">
              <tr>
                <td className="px-6 py-4 font-bold text-slate-900">الإجمالي</td>
                <td className="px-6 py-4 font-bold text-slate-700">{totals.males || "—"}</td>
                <td className="px-6 py-4 font-bold text-slate-700">{totals.females || "—"}</td>
                <td className="px-6 py-4 font-bold text-amber-600">{totals.total}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
          <span className="text-lg">✅</span>
          <h2 className="font-bold text-slate-900">الإجمالي الكلي</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-slate-500 text-sm mb-1">رجال</p>
              <p className="text-2xl font-bold text-slate-800">{totals.males || "—"}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-slate-500 text-sm mb-1">نساء</p>
              <p className="text-2xl font-bold text-slate-800">{totals.females || "—"}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4">
              <p className="text-emerald-600 text-sm mb-1">الكلي</p>
              <p className="text-2xl font-bold text-emerald-700">{totals.total}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
