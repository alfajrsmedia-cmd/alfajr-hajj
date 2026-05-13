"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search } from "lucide-react";

type Pilgrim = {
  id: string;
  full_name: string;
  passport_number: string;
  phone?: string;
  nationality?: string;
  group_id?: string;
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Pilgrim[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    if (val.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("pilgrims")
      .select("*")
      .ilike("full_name", `%${val}%`)
      .limit(20);
    setResults(data || []);
    setSearched(true);
    setLoading(false);
  }

  return (
    <div>
      <header className="mb-6 flex items-center gap-2">
        <Search className="w-6 h-6 text-slate-600" />
        <h1 className="text-2xl font-bold text-slate-900">البحث التفصيلي</h1>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder="اكتب جزء من اسم الحاج..."
          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-emerald-400 text-slate-800 placeholder-slate-400"
          autoFocus
        />

        <div className="mt-6">
          {loading && (
            <p className="text-center text-slate-400">جاري البحث...</p>
          )}

          {!loading && searched && results.length === 0 && (
            <p className="text-center text-slate-400">لا توجد نتائج</p>
          )}

          {!loading && !searched && (
            <p className="text-center text-slate-400">
              اكتب جزء من اسم الحاج للبحث
            </p>
          )}

          {!loading && results.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500">
                    <th className="pb-3 font-medium">الاسم</th>
                    <th className="pb-3 font-medium">رقم الجواز</th>
                    <th className="pb-3 font-medium">الجنسية</th>
                    <th className="pb-3 font-medium">الهاتف</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {results.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 font-medium text-slate-800">{p.full_name}</td>
                      <td className="py-3 text-slate-600">{p.passport_number}</td>
                      <td className="py-3 text-slate-600">{p.nationality || "-"}</td>
                      <td className="py-3 text-slate-600">{p.phone || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
