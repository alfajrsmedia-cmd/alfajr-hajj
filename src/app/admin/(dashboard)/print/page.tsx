import Link from "next/link";
import { Printer, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function PrintIndexPage() {
  const supabase = await createClient();
  const { data: floors } = await supabase
    .from("floors")
    .select("id, floor_number, floor_name")
    .order("floor_number");

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          كشوف الطباعة
        </h1>
        <p className="text-slate-500 mt-1">
          كشوف تسكين الحجاج بنفس التنسيق الورقي
        </p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {floors?.map((floor) => (
          <Link
            key={floor.id}
            href={`/admin/print/floor/${floor.floor_number}`}
            target="_blank"
            className="bg-white p-6 rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition">
                <Building2 className="w-6 h-6 text-emerald-700" />
              </div>
              <Printer className="w-5 h-5 text-slate-400" />
            </div>
            <h3 className="font-bold text-slate-900">{floor.floor_name}</h3>
            <p className="text-xs text-slate-500 mt-1">
              كشف التسكين الكامل للطباعة
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
