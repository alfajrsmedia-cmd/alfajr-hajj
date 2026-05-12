import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { UserCog } from "lucide-react";

export default async function GroupsPage() {
  const supabase = await createClient();

  const { data: groups } = await supabase
    .from("groups")
    .select(
      `
      id,
      group_number,
      group_name,
      leader_name,
      leader_phone,
      pilgrims(count)
    `
    )
    .order("group_number", { ascending: true });

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          المجموعات
        </h1>
        <p className="text-slate-500 mt-1 arabic-num">
          إجمالي: {groups?.length || 0} مجموعة
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {groups?.map((g: any) => {
          const count = g.pilgrims?.[0]?.count || 0;
          return (
            <Link
              key={g.id}
              href={`/admin/groups/${g.id}`}
              className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <UserCog className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 arabic-num">
                    مجموعة {g.group_number}
                  </div>
                  <div className="text-xs text-slate-500 arabic-num">
                    {count} حاج
                  </div>
                </div>
              </div>
              {g.leader_name && (
                <p className="text-xs text-slate-600 mt-2 truncate">
                  المسؤول: {g.leader_name}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
