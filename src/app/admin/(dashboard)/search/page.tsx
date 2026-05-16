"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, Users, Building2, Home } from "lucide-react";

type Result = {
  id: string;
  full_name: string;
  group_number?: number;
  leader_name?: string;
  room_number?: string;
  floor_name?: string;
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async (val: string) => {
    setQuery(val);
    if (val.length < 1) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.rpc("search_pilgrims", { query: val });
    setResults(data || []);
    setSearched(true);
    setLoading(false);
  }, []);

  return (
    <div>
      <header className="mb-6 flex items-center gap-2">
        <Search className="w-6 h-6 text-slate-600" />
        <h1 className="text-2xl font-bold text-slate-900">البحث التفصيلي</h1>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
        <input
          type="text"
          value={query}
          onChange={e => handleSearch(e.target.value)}
          placeholder="اكتب اسم أو رقم هاتف أو رقم تصريح..."
          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-emerald-400 text-slate-800 placeholder-slate-400 text-lg"
          autoFocus
        />
      </div>

      <div className="space-y-3">
        {loading && (
          <p className="text-center text-slate-400 py-8">جاري البحث...</p>
        )}
        {!loading && !searched && (
          <p className="text-center text-slate-400 py-8">اكتب جزء من الاسم أو الرقم للبحث</p>
        )}
        {!loading && searched && results.length === 0 && (
          <p className="text-center text-slate-400 py-8">لا توجد نتائج</p>
        )}
        {!loading && results.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-bold text-slate-900 text-lg text-right mb-3">{p.full_name}</h3>
            <div className="flex flex-wrap gap-2 justify-end">
              {p.leader_name && (
                <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-sm">
                  <Users className="w-4 h-4" />{p.leader_name}
                </span>
              )}
              {p.group_number && (
                <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm">
                  <Users className="w-4 h-4" />مجموعة {p.group_number}
                </span>
              )}
              {p.room_number && (
                <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm">
                  <Building2 className="w-4 h-4" />غرفة {p.room_number}
                </span>
              )}
              {p.floor_name && (
                <span className="flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-sm">
                  <Home className="w-4 h-4" />{p.floor_name}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
