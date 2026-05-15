"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PilgrimLogin() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<any[]>([]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError("");
    setResults([]);
    const supabase = createClient();

    try {
      // 1. Try ref_number (رقم التصريح) from campaign_pilgrims
      if (/^\d+$/.test(q)) {
        const { data: cp } = await supabase
          .from("campaign_pilgrims")
          .select("passport_number")
          .eq("ref_number", parseInt(q))
          .limit(1);

        if (cp && cp.length > 0) {
          const { data: p } = await supabase
            .from("pilgrims")
            .select("id, full_name, groups(group_number)")
            .eq("passport_number", cp[0].passport_number)
            .single();
          if (p) { router.push(`/pilgrim/${p.id}`); return; }
        }

        // 2. Try phone in pilgrims
        const { data: byPhone } = await supabase
          .from("pilgrims")
          .select("id, full_name, groups(group_number)")
          .eq("phone", q)
          .limit(10);

        if (byPhone && byPhone.length === 1) {
          router.push(`/pilgrim/${byPhone[0].id}`); return;
        }
        if (byPhone && byPhone.length > 1) {
          setResults(byPhone); return;
        }

        // 3. Try leader_phone in groups
        const { data: grps } = await supabase
          .from("groups")
          .select("id")
          .eq("leader_phone", q);

        if (grps && grps.length > 0) {
          const groupIds = grps.map((g: any) => g.id);
          const { data: gp } = await supabase
            .from("pilgrims")
            .select("id, full_name, groups(group_number)")
            .in("group_id", groupIds)
            .order("full_name");
          if (gp && gp.length === 1) { router.push(`/pilgrim/${gp[0].id}`); return; }
          if (gp && gp.length > 1) { setResults(gp); return; }
        }
      }

      setError("لم يتم العثور على نتائج. تأكد من رقم التصريح أو رقم الهاتف.");
    } catch (err: any) {
      setError(err.message || "حدث خطأ، حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-4xl">🕌</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">حملة الفجر للحج والعمرة</h1>
          <p className="text-slate-500 text-sm mt-1">بوابة الحاج — موسم 1447هـ</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-lg font-bold text-slate-800 mb-1">تسجيل الدخول</h2>
          <p className="text-sm text-slate-500 mb-6">أدخل رقم تصريحك أو رقم هاتفك</p>

          <form onSubmit={handleSearch} className="space-y-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="رقم التصريح أو رقم الهاتف"
              inputMode="numeric"
              className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none text-xl font-bold text-center tracking-wider"
              required
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white py-3.5 rounded-xl font-bold text-lg transition"
            >
              {loading ? "جاري البحث..." : "دخول"}
            </button>
          </form>

          {results.length > 0 && (
            <div className="mt-6">
              <p className="text-sm text-slate-600 mb-3 font-medium">اختر اسمك:</p>
              <div className="space-y-2">
                {results.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => router.push(`/pilgrim/${p.id}`)}
                    className="w-full text-right bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 p-3.5 rounded-xl transition"
                  >
                    <div className="font-bold text-slate-900">{p.full_name}</div>
                    {p.groups && (
                      <div className="text-xs text-slate-500 mt-0.5">
                        مجموعة رقم: {p.groups.group_number}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          للمساعدة اتصل بالإدارة: 065389222
        </p>
      </div>
    </div>
  );
}
