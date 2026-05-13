import { createClient } from "@/lib/supabase/server";
import { TableIcon } from "lucide-react";

export default async function FinalTablePage() {
  const supabase = await createClient();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, name")
    .order("id");

  const rows = await Promise.all(
    (campaigns || []).map(async (c) => {
      const { data: pilgrims } = await supabase
        .from("pilgrims")
        .select("id, gender")
        .eq("campaign_id", c.id);

      const malePilgrims = pilgrims?.filter((p) => p.gender === "male").length || 0;
      const femalePilgrims = pilgrims?.filter((p) => p.gender === "female").length || 0;
      const totalPilgrims = malePilgrims + femalePilgrims;

      return {
        id: c.id,
        name: c.name,
        malePilgrims,
        femalePilgrims,
        totalPilgrims,
        maleAdmins: 0,
        femaleAdmins: 0,
        totalAdmins: 0,
        total: totalPilgrims,
      };
    })
  );

  const totals = rows.reduce(
    (acc, r) => ({
      malePilgrims: acc.malePilgrims + r.malePilgrims,
      femalePilgrims: acc.femalePilgrims + r.femalePilgrims,
      totalPilgrims: acc.totalPilgrims + r.totalPilgrims,
      maleAdmins: acc.maleAdmins + r.maleAdmins,
      femaleAdmins: acc.femaleAdmins + r.femaleAdmins,
      totalAdmins: acc.totalAdmins + r.totalAdmins,
      total: acc.total + r.total,
    }),
    { malePilgrims: 0, femalePilgrims: 0, totalPilgrims: 0, maleAdmins: 0, femaleAdmins: 0, totalAdmins: 0, total: 0 }
  );

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TableIcon className="w-6 h-6 text-slate-600" />
          <h1 className="text-2xl font-bold text-slate-900">الجدول النهائي</h1>
        </div>
      </header>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">الحملة</th>
                <th className="px-4 py-3 font-semibold text-slate-700">حجاج رجال</th>
                <th className="px-4 py-3 font-semibold text-slate-700">حجاج نساء</th>
                <th className="px-4 py-3 font-semibold text-emerald-700">مجموع الحجاج</th>
                <th className="px-4 py-3 font-semibold text-slate-700">إداريين رجال</th>
                <th className="px-4 py-3 font-semibold text-slate-700">إداريين نساء</th>
                <th className="px-4 py-3 font-semibold text-slate-700">مجموع الإداريين</th>
                <th className="px-4 py-3 font-semibold text-amber-700">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-medium text-slate-800">{r.name}</td>
                  <td className="px-4 py-3 text-slate-600">{r.malePilgrims}</td>
                  <td className="px-4 py-3 text-slate-600">{r.femalePilgrims}</td>
                  <td className="px-4 py-3 font-bold text-emerald-700">{r.totalPilgrims}</td>
                  <td className="px-4 py-3 text-slate-400">—</td>
                  <td className="px-4 py-3 text-slate-400">—</td>
                  <td className="px-4 py-3 text-slate-400">—</td>
                  <td className="px-4 py-3 font-bold text-amber-700">{r.total}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 border-t-2 border-slate-200">
              <tr>
                <td className="px-4 py-3 font-bold text-slate-900">الإجمالي</td>
                <td className="px-4 py-3 font-bold text-slate-700">{totals.malePilgrims}</td>
                <td className="px-4 py-3 font-bold text-slate-700">{totals.femalePilgrims}</td>
                <td className="px-4 py-3 font-bold text-emerald-700">{totals.totalPilgrims}</td>
                <td className="px-4 py-3 font-bold text-slate-700">{totals.maleAdmins}</td>
                <td className="px-4 py-3 font-bold text-slate-700">{totals.femaleAdmins}</td>
                <td className="px-4 py-3 font-bold text-slate-700">{totals.totalAdmins}</td>
                <td className="px-4 py-3 font-bold text-amber-700">{totals.total}</td>
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">الفئة</th>
                <th className="px-4 py-3 font-semibold text-slate-700">رجال</th>
                <th className="px-4 py-3 font-semibold text-slate-700">نساء</th>
                <th className="px-4 py-3 font-semibold text-amber-700">المجموع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <tr>
                <td className="px-4 py-3 font-medium text-slate-800">الحجاج</td>
                <td className="px-4 py-3 text-slate-600">{totals.malePilgrims}</td>
                <td className="px-4 py-3 text-slate-600">{totals.femalePilgrims}</td>
                <td className="px-4 py-3 font-bold text-amber-700">{totals.totalPilgrims}</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-800">الإداريين</td>
                <td className="px-4 py-3 text-slate-600">{totals.maleAdmins}</td>
                <td className="px-4 py-3 text-slate-600">{totals.femaleAdmins}</td>
                <td className="px-4 py-3 font-bold text-amber-700">{totals.totalAdmins}</td>
              </tr>
              <tr className="bg-slate-50 font-bold">
                <td className="px-4 py-3 text-slate-900">الكلي</td>
                <td className="px-4 py-3 text-slate-700">{totals.malePilgrims + totals.maleAdmins}</td>
                <td className="px-4 py-3 text-slate-700">{totals.femalePilgrims + totals.femaleAdmins}</td>
                <td className="px-4 py-3 text-amber-700">{totals.total}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
