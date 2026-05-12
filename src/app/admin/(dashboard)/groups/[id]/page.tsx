import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, UserCog } from "lucide-react";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const groupId = parseInt(id);

  const { data: group } = await supabase
    .from("groups")
    .select("*")
    .eq("id", groupId)
    .single();

  if (!group) notFound();

  const { data: members } = await supabase
    .from("v_pilgrim_housing")
    .select("*")
    .eq("group_number", group.group_number)
    .order("floor_number")
    .order("room_number");

  return (
    <div>
      <Link
        href="/admin/groups"
        className="inline-flex items-center text-emerald-700 mb-4 hover:underline text-sm"
      >
        <ArrowRight className="w-4 h-4 ml-1" />
        رجوع للمجموعات
      </Link>

      <header className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <UserCog className="w-7 h-7 text-emerald-600" />
            مجموعة رقم {group.group_number}
          </h1>
          {group.leader_name && (
            <p className="text-slate-500 mt-1 text-sm">
              المسؤول: {group.leader_name}
            </p>
          )}
        </div>
        <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg">
          <div className="text-2xl font-bold arabic-num">
            {members?.length || 0}
          </div>
          <div className="text-xs">حاج في المجموعة</div>
        </div>
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-right p-3 font-medium text-slate-700">
                الاسم
              </th>
              <th className="text-right p-3 font-medium text-slate-700">
                الطابق
              </th>
              <th className="text-right p-3 font-medium text-slate-700">
                الغرفة
              </th>
              <th className="text-right p-3 font-medium text-slate-700">
                الهاتف
              </th>
              <th className="p-3 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members?.map((m: any) => (
              <tr key={m.pilgrim_id} className="hover:bg-slate-50">
                <td className="p-3 font-medium text-slate-900">
                  {m.full_name}
                </td>
                <td className="p-3 text-slate-600 arabic-num">
                  {m.floor_number || "—"}
                </td>
                <td className="p-3">
                  <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs font-medium arabic-num">
                    {m.room_number || "—"}
                  </span>
                </td>
                <td className="p-3 text-slate-500 text-xs arabic-num">
                  {m.phone || "—"}
                </td>
                <td className="p-3">
                  <Link
                    href={`/admin/pilgrims/${m.pilgrim_id}`}
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
    </div>
  );
}
