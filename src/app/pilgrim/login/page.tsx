"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, AlertCircle, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function PilgrimLogin() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<any[]>([]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError("");
    setResults([]);

    const supabase = createClient();

    try {
      // Search by name, passport, national ID, or phone
      const { data, error: dbError } = await supabase
        .from("pilgrims")
        .select(
          `
          id,
          full_name,
          passport_number,
          national_id,
          phone,
          group_id,
          groups(group_number)
        `
        )
        .or(
          `full_name.ilike.%${searchQuery}%,passport_number.eq.${searchQuery},national_id.eq.${searchQuery},phone.eq.${searchQuery}`
        )
        .limit(10);

      if (dbError) throw dbError;

      if (!data || data.length === 0) {
        setError("لم يتم العثور على نتائج. تأكد من البيانات المدخلة.");
      } else if (data.length === 1) {
        // Single match - go directly to pilgrim page
        router.push(`/pilgrim/${data[0].id}`);
      } else {
        setResults(data);
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Link
          href="/"
          className="inline-flex items-center text-emerald-700 mb-6 hover:underline"
        >
          <ArrowRight className="w-4 h-4 ml-1" />
          رجوع للرئيسية
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-emerald-700" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              بوابة الحاج
            </h1>
            <p className="text-slate-600 text-sm">
              ادخل اسمك أو رقم جوازك للاطلاع على بيانات السكن
            </p>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                الاسم، رقم الجواز، أو رقم الهاتف
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="أدخل اسمك أو رقم جوازك..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white py-3 rounded-lg font-medium transition"
            >
              {loading ? "جاري البحث..." : "بحث"}
            </button>
          </form>

          {results.length > 0 && (
            <div className="mt-6 space-y-2">
              <p className="text-sm text-slate-600 mb-3">
                وجدنا {results.length} نتائج - اختر الحاج:
              </p>
              {results.map((p) => (
                <Link
                  key={p.id}
                  href={`/pilgrim/${p.id}`}
                  className="block bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 p-3 rounded-lg transition"
                >
                  <div className="font-medium text-slate-900">
                    {p.full_name}
                  </div>
                  {p.groups && (
                    <div className="text-xs text-slate-500 mt-1">
                      مجموعة رقم: {p.groups.group_number}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          للمساعدة: 065389222
        </p>
      </div>
    </div>
  );
}
