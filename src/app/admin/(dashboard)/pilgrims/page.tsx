"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const PAGE_SIZE = 25;

export default function PilgrimsPage() {
  const [search, setSearch] = useState("");
  const [floorFilter, setFloorFilter] = useState<string>("");
  const [page, setPage] = useState(0);
  const [pilgrims, setPilgrims] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPilgrims();
  }, [search, floorFilter, page]);

  async function loadPilgrims() {
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from("v_pilgrim_housing")
      .select("*", { count: "exact" })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
      .order("pilgrim_id", { ascending: true });

    if (search.trim()) {
      query = query.or(
        `full_name.ilike.%${search}%,passport_number.ilike.%${search}%,phone.ilike.%${search}%`
      );
    }

    if (floorFilter) {
      query = query.eq("floor_number", parseInt(floorFilter));
    }

    const { data, count } = await query;
    setPilgrims(data || []);
    setTotal(count || 0);
    setLoading(false);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          الحجاج
        </h1>
        <p className="text-slate-500 mt-1 arabic-num">
          إجمالي: {total} حاج
        </p>
      </header>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-6 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="ابحث بالاسم، الجواز، أو الهاتف..."
            className="w-full pr-10 pl-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
          />
        </div>
        <select
          value={floorFilter}
          onChange={(e) => {
            setFloorFilter(e.target.value);
            setPage(0);
          }}
          className="px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white"
        >
          <option value="">كل الطوابق</option>
          {[1, 2, 3, 4, 5, 6].map((f) => (
            <option key={f} value={f}>
              الطابق {f}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-right p-3 font-medium text-slate-700">
                  الاسم
                </th>
                <th className="text-right p-3 font-medium text-slate-700">
                  المجموعة
                </th>
                <th className="text-right p-3 font-medium text-slate-700">
                  الطابق
                </th>
                <th className="text-right p-3 font-medium text-slate-700">
                  الغرفة
                </th>
                <th className="text-right p-3 font-medium text-slate-700">
                  الجواز
                </th>
                <th className="text-right p-3 font-medium text-slate-700">
                  الهاتف
                </th>
                <th className="p-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    جاري التحميل...
                  </td>
                </tr>
              )}
              {!loading && pilgrims.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    لا توجد نتائج
                  </td>
                </tr>
              )}
              {!loading &&
                pilgrims.map((p: any) => (
                  <tr key={p.pilgrim_id} className="hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-900">
                      {p.full_name}
                    </td>
                    <td className="p-3 text-slate-600 arabic-num">
                      {p.group_number || "—"}
                    </td>
                    <td className="p-3 text-slate-600 arabic-num">
                      {p.floor_number || "—"}
                    </td>
                    <td className="p-3">
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs font-medium arabic-num">
                        {p.room_number || "—"}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 text-xs arabic-num">
                      {p.passport_number || "—"}
                    </td>
                    <td className="p-3 text-slate-500 text-xs arabic-num">
                      {p.phone || "—"}
                    </td>
                    <td className="p-3">
                      <Link
                        href={`/admin/pilgrims/${p.pilgrim_id}`}
                        className="text-emerald-700 hover:underline text-xs"
                      >
                        عرض
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm text-slate-500 arabic-num">
              صفحة {page + 1} من {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
