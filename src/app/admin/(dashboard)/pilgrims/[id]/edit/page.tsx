"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Save, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function PilgrimEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);

  const [pilgrim, setPilgrim] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => { loadPilgrim() }, [id]);

  async function loadPilgrim() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from("pilgrims").select("*").eq("id", id).single();
    setPilgrim(data);
    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.from("pilgrims").update({
      full_name: pilgrim.full_name,
      national_id: pilgrim.national_id || null,
      passport_number: pilgrim.passport_number || null,
      phone: pilgrim.phone || null,
      email: pilgrim.email || null,
      birth_date: pilgrim.birth_date || null,
      gender: pilgrim.gender || null,
      nationality: pilgrim.nationality || null,
      emergency_contact_name: pilgrim.emergency_contact_name || null,
      emergency_contact_phone: pilgrim.emergency_contact_phone || null,
      medical_notes: pilgrim.medical_notes || null,
      special_needs: pilgrim.special_needs || null,
      program: pilgrim.program || null,
      room_type: pilgrim.room_type || null,
      level: pilgrim.level || null,
      permit_number: pilgrim.permit_number || null,
      notes: pilgrim.notes || null,
    }).eq("id", id);

    if (error) {
      setMessage({ type: "error", text: "حدث خطأ: " + error.message });
    } else {
      setMessage({ type: "success", text: "تم الحفظ بنجاح ✓" });
      setTimeout(() => router.push(`/admin/pilgrims/${id}`), 1000);
    }
    setSaving(false);
  }

  if (loading) return <div className="text-center py-12 text-slate-400">جاري التحميل...</div>;
  if (!pilgrim) return <div className="text-center py-12 text-red-500">لم يتم العثور على الحاج</div>;

  return (
    <div dir="rtl">
      <Link href={`/admin/pilgrims/${id}`} className="inline-flex items-center text-emerald-700 mb-4 hover:underline text-sm gap-1">
        <ArrowRight className="w-4 h-4" />
        رجوع للملف الشخصي
      </Link>

      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">تعديل بيانات {pilgrim.full_name}</h1>
      </header>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm flex items-start gap-2 ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="font-bold text-slate-900 mb-4">البيانات الشخصية</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="الاسم الكامل" value={pilgrim.full_name} onChange={v => setPilgrim({ ...pilgrim, full_name: v })} required />
            <Field label="رقم الهوية" value={pilgrim.national_id || ""} onChange={v => setPilgrim({ ...pilgrim, national_id: v })} />
            <Field label="رقم الجواز" value={pilgrim.passport_number || ""} onChange={v => setPilgrim({ ...pilgrim, passport_number: v })} />
            <Field label="رقم الهاتف" value={pilgrim.phone || ""} onChange={v => setPilgrim({ ...pilgrim, phone: v })} type="tel" />
            <Field label="البريد الإلكتروني" value={pilgrim.email || ""} onChange={v => setPilgrim({ ...pilgrim, email: v })} type="email" />
            <Field label="تاريخ الميلاد" value={pilgrim.birth_date || ""} onChange={v => setPilgrim({ ...pilgrim, birth_date: v })} type="date" />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">الجنس</label>
              <select value={pilgrim.gender || ""} onChange={e => setPilgrim({ ...pilgrim, gender: e.target.value || null })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white">
                <option value="">— غير محدد —</option>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>
            <Field label="الجنسية" value={pilgrim.nationality || ""} onChange={v => setPilgrim({ ...pilgrim, nationality: v })} />
            <Field label="البرنامج" value={pilgrim.program || ""} onChange={v => setPilgrim({ ...pilgrim, program: v })} />
            <Field label="نوع الغرفة" value={pilgrim.room_type || ""} onChange={v => setPilgrim({ ...pilgrim, room_type: v })} />
            <Field label="المستوى" value={pilgrim.level || ""} onChange={v => setPilgrim({ ...pilgrim, level: v })} />
            <Field label="رقم التصريح" value={pilgrim.permit_number || ""} onChange={v => setPilgrim({ ...pilgrim, permit_number: v })} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="font-bold text-slate-900 mb-4">جهة الاتصال للطوارئ</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="الاسم" value={pilgrim.emergency_contact_name || ""} onChange={v => setPilgrim({ ...pilgrim, emergency_contact_name: v })} />
            <Field label="رقم الهاتف" value={pilgrim.emergency_contact_phone || ""} onChange={v => setPilgrim({ ...pilgrim, emergency_contact_phone: v })} type="tel" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="font-bold text-slate-900 mb-4">ملاحظات</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ملاحظات طبية</label>
              <textarea value={pilgrim.medical_notes || ""} onChange={e => setPilgrim({ ...pilgrim, medical_notes: e.target.value })} rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">احتياجات خاصة</label>
              <textarea value={pilgrim.special_needs || ""} onChange={e => setPilgrim({ ...pilgrim, special_needs: e.target.value })} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ملاحظات عامة</label>
              <textarea value={pilgrim.notes || ""} onChange={e => setPilgrim({ ...pilgrim, notes: e.target.value })} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-6 py-2.5 rounded-lg font-medium transition">
            <Save className="w-4 h-4" />
            {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
    </div>
  );
}
