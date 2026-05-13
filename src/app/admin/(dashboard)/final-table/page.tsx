"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { TableProperties, Plus, Download, Trash2 } from "lucide-react";

type Campaign = {
  id: number;
  name: string;
  male_pilgrims: number;
  female_pilgrims: number;
  male_admins: number;
  female_admins: number;
};

export default function FinalTablePage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", male_pilgrims: "", female_pilgrims: "", male_admins: "", female_admins: "" });

  const supabase = createClient();

  async function load() {
    const { data } = await supabase.from("final_table_campaigns").select("*").order("id");
    setCampaigns(data || []);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd() {
    if (!form.name) return;
    await supabase.from("final_table_campaigns").insert({
      name: form.name,
      male_pilgrims: Number(form.male_pilgrims) || 0,
      female_pilgrims: Number(form.female_pilgrims) || 0,
      male_admins: Number(form.male_admins) || 0,
      female_admins: Number(form.female_admins) || 0,
    });
    setForm({ name: "", male_pilgrims: "", female_pilgrims: "", male_admins: "", female_admins: "" });
    setShowForm(false);
    load();
  }

  async function handleDelete(id: number) {
    await supabase.from("final_table_campaigns").delete().eq("id", id);
    load();
  }

  const totalPilgrimsMale = campaigns.reduce((s, c) => s + c.male_pilgrims, 0);
  const totalPilgrimsFemale = campaigns.reduce((s, c) => s + c.female_pilgrims, 0);
  const totalPilgrims = totalPilgrimsMale + totalPilgrimsFemale;
  const totalAdminsMale = campaigns.reduce((s, c) => s + c.male_admins, 0);
  const totalAdminsFemale = campaigns.reduce((s, c) => s + c.female_admins, 0);
  const totalAdmins = totalAdminsMale + totalAdminsFemale;
  const grandTotal = totalPilgrims + totalAdmins;

  function exportExcel() {
    const rows = [
      ["الحملة", "حجاج رجال", "حجاج نساء", "مجموع الحجاج", "إداريين رجال", "إداريين نساء", "مجموع الإداريين", "الإجمالي"],
      ...campaigns.map(c => [c.name, c.male_pilgrims, c.female_pilgrims, c.male_pilgrims + c.female_pilgrims, c.male_admins, c.female_admins, c.male_admins + c.female_admins, c.male_pilgrims + c.female_pilgrims + c.male_admins + c.female_admins]),
      ["الإجمالي", totalPilgrimsMale, totalPilgrimsFemale, totalPilgrims, totalAdminsMale, totalAdminsFemale, totalAdmins, grandTotal],
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "الجدول_النهائي.csv";
    a.click();
  }

  return (
    <div>
      <header className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <TableProperties className="w-6 h-6 text-slate-600" />
          <h1 className="text-2xl font-bold text-slate-900">الجدول النهائي</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={exportExcel} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            <Download className="w-4 h-4" />تصدير Excel ↓
          </button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition">
            <Plus className="w-4 h-4" />إضافة حملة
          </button>
        </div>
      </header>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <h2 className="font-bold text-slate-900 mb-4 text-right">إضافة حملة جديدة</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <input placeholder="اسم الحملة" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="col-span-2 md:col-span-3 border border-slate-200 rounded-lg px-3 py-2 text-right text-sm" />
            <input placeholder="حجاج رجال" type="number" value={form.male_pilgrims} onChange={e => setForm({ ...form, male_pilgrims: e.target.value })} className="border border-slate-200 rounded-lg px-3 py-2 text-right text-sm" />
            <input placeholder="حجاج نساء" type="number" value={form.female_pilgrims} onChange={e => setForm({ ...form, female_pilgrims: e.target.value })} className="border border-slate-200 rounded-lg px-3 py-2 text-right text-sm" />
            <input placeholder="إداريين رجال" type="number" value={form.male_admins} onChange={e => setForm({ ...form, male_admins: e.target.value })} className="border border-slate-200 rounded-lg px-3 py-2 text-right text-sm" />
            <input placeholder="إداريين نساء" type="number" value={form.female_admins} onChange={e => setForm({ ...form, female_admins: e.target.value })} className="border border-slate-200 rounded-lg px-3 py-2 text-right text-sm" />
          </div>
          <div className="flex gap-2 mt-4 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200">إلغاء</button>
            <button onClick={handleAdd} className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">إضافة</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 w-8"></th>
                <th className="px-4 py-3 font-semibold text-slate-700">الحملة</th>
                <th className="px-4 py-3 font-semibold text-slate-700">حجاج رجال</th>
                <th className="px-4 py-3 font-semibold text-slate-700">حجاج نساء</th>
                <th className="px-4 py-3 font-semibold text-emerald-700">مجموع الحجاج</th>
                <th className="px-4 py-3 font-semibold text-slate-700">إداريين رجال</th>
                <th className="px-4 py-3 font-semibold text-slate-700">إداريين نساء</th>
                <th className="px-4 py-3 font-semibold text-slate-700">مجموع الإداريين</th>
                <th className="px-4 py-3 font-semibold text-amber-600">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {campaigns.map((c) => {
                const totalP = c.male_pilgrims + c.female_pilgrims;
                const totalA = c.male_admins + c.female_admins;
                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(c.id)} className="text-slate-300 hover:text-red-400 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                    <td className="px-4 py-3 text-slate-600">{c.male_pilgrims}</td>
                    <td className="px-4 py-3 text-slate-600">{c.female_pilgrims}</td>
                    <td className="px-4 py-3 font-bold text-emerald-700">{totalP}</td>
                    <td className="px-4 py-3"><span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs">{c.male_admins}</span></td>
                    <td className="px-4 py-3"><span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs">{c.female_admins}</span></td>
                    <td className="px-4 py-3 text-slate-600">{totalA}</td>
                    <td className="px-4 py-3 font-bold text-amber-600">{totalP + totalA}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50 border-t-2 border-slate-200">
              <tr>
                <td></td>
                <td className="px-4 py-3 font-bold text-slate-900">الإجمالي</td>
                <td className="px-4 py-3 font-bold">{totalPilgrimsMale}</td>
                <td className="px-4 py-3 font-bold">{totalPilgrimsFemale}</td>
                <td className="px-4 py-3 font-bold text-emerald-700">{totalPilgrims}</td>
                <td className="px-4 py-3 font-bold">{totalAdminsMale}</td>
                <td className="px-4 py-3 font-bold">{totalAdminsFemale}</td>
                <td className="px-4 py-3 font-bold">{totalAdmins}</td>
                <td className="px-4 py-3 font-bold text-amber-600">{grandTotal}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
          <span>✅</span>
          <h2 className="font-bold text-slate-900">الإجمالي الكلي</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3 font-semibold text-slate-700">الفئة</th>
                <th className="px-6 py-3 font-semibold text-slate-700">رجال</th>
                <th className="px-6 py-3 font-semibold text-slate-700">نساء</th>
                <th className="px-6 py-3 font-semibold text-amber-600">المجموع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <tr>
                <td className="px-6 py-3 font-medium text-slate-800">الحجاج</td>
                <td className="px-6 py-3 text-slate-600">{totalPilgrimsMale}</td>
                <td className="px-6 py-3 text-slate-600">{totalPilgrimsFemale}</td>
                <td className="px-6 py-3 font-bold text-amber-600">{totalPilgrims}</td>
              </tr>
              <tr>
                <td className="px-6 py-3 font-medium text-slate-800">الإداريين</td>
                <td className="px-6 py-3 text-slate-600">{totalAdminsMale}</td>
                <td className="px-6 py-3 text-slate-600">{totalAdminsFemale}</td>
                <td className="px-6 py-3 font-bold text-amber-600">{totalAdmins}</td>
              </tr>
              <tr className="bg-slate-50 font-bold">
                <td className="px-6 py-3 text-slate-900">الكلي</td>
                <td className="px-6 py-3 text-slate-700">{totalPilgrimsMale + totalAdminsMale}</td>
                <td className="px-6 py-3 text-slate-700">{totalPilgrimsFemale + totalAdminsFemale}</td>
                <td className="px-6 py-3 text-amber-600">{grandTotal}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
