import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PilgrimQR from "@/components/PilgrimQR";
import PilgrimMessages from "@/components/PilgrimMessages";

export default async function PilgrimPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pilgrimId = parseInt(id);
  const supabase = await createClient();

  const { data: pilgrim } = await supabase
    .from("pilgrims")
    .select(
      `id, full_name, passport_number, national_id, phone, program, room_type,
       level, travel_from, travel_to, emergency_contact_name, emergency_contact_phone,
       groups(group_number, group_name, leader_name, leader_phone)`
    )
    .eq("id", pilgrimId)
    .single();

  if (!pilgrim) notFound();

  const { data: housing } = await supabase
    .from("v_pilgrim_housing")
    .select("*")
    .eq("pilgrim_id", pilgrimId)
    .maybeSingle();

  const [busRes, cpRes, roommatesRes, messagesRes] = await Promise.all([
    supabase
      .from("bus_distribution")
      .select("bus_number")
      .eq("passport_number", pilgrim.passport_number)
      .maybeSingle(),
    supabase
      .from("campaign_pilgrims")
      .select("ref_number, booking_type")
      .eq("passport_number", pilgrim.passport_number)
      .maybeSingle(),
    housing?.room_number
      ? supabase
          .from("v_pilgrim_housing")
          .select("pilgrim_id, full_name, group_number")
          .eq("room_number", housing.room_number)
          .eq("floor_number", housing.floor_number)
          .neq("pilgrim_id", pilgrimId)
      : Promise.resolve({ data: [] }),
    supabase
      .from("pilgrim_messages")
      .select("id, message, admin_reply, status, created_at, replied_at")
      .eq("pilgrim_id", pilgrimId)
      .order("created_at", { ascending: false }),
  ]);

  const bus = busRes.data;
  const cp = cpRes.data;
  const roommates = (roommatesRes.data as any[]) || [];
  const messages = messagesRes.data || [];
  const group = pilgrim.groups as any;

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* Header */}
      <header className="bg-emerald-700 text-white shadow-md print:hidden">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/pilgrim/login" className="text-sm hover:opacity-80 flex items-center gap-1">
            ← بحث آخر
          </Link>
          <h1 className="font-bold text-sm">حملة الفجر للحج والعمرة</h1>
          <button
            onClick={() => { if (typeof window !== "undefined") window.print(); }}
            className="text-sm hover:opacity-80"
          >
            🖨️ طباعة
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Name Card */}
        <div className="bg-emerald-700 text-white rounded-2xl p-5 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {cp?.ref_number && (
              <p className="text-xs text-emerald-200 mb-1">
                رقم التصريح: <span className="font-bold">{cp.ref_number}</span>
              </p>
            )}
            <h2 className="text-xl font-black leading-snug">{pilgrim.full_name}</h2>
            {group?.group_number && (
              <p className="text-emerald-200 mt-1.5 text-sm">مجموعة رقم: {group.group_number}</p>
            )}
            {pilgrim.program && (
              <p className="text-emerald-100 text-sm mt-0.5">✈️ {pilgrim.program}</p>
            )}
          </div>
          <div className="bg-white p-1.5 rounded-xl shrink-0">
            <PilgrimQR
              data={JSON.stringify({
                id: pilgrimId,
                name: pilgrim.full_name,
                ref: cp?.ref_number,
                group: group?.group_number,
              })}
            />
          </div>
        </div>

        {/* Housing */}
        {housing && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 mb-3">🏨 بيانات السكن</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-1">الفندق</p>
                <p className="font-bold text-slate-800 text-sm leading-snug">{housing.hotel_name || "—"}</p>
                {housing.hotel_city && (
                  <p className="text-xs text-slate-400 mt-0.5">{housing.hotel_city}</p>
                )}
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-1">الطابق</p>
                <p className="font-bold text-slate-800 text-sm">{housing.floor_name || "—"}</p>
                <p className="text-xs text-slate-400 mt-0.5">رقم {housing.floor_number}</p>
              </div>
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-3">
                <p className="text-xs text-emerald-600 mb-1">رقم الغرفة</p>
                <p className="font-black text-emerald-700 text-3xl leading-none">{housing.room_number || "—"}</p>
                <p className="text-xs text-slate-400 mt-0.5">سعة {housing.room_capacity}</p>
              </div>
            </div>
          </div>
        )}

        {/* Group Leader */}
        {group && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 mb-3">👥 المجموعة والمسؤول</p>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-slate-800">مجموعة رقم {group.group_number}</p>
                {group.leader_name && (
                  <p className="text-sm text-slate-600 mt-0.5">
                    المسؤول: <span className="font-medium">{group.leader_name}</span>
                  </p>
                )}
              </div>
              {group.leader_phone && (
                <a
                  href={`tel:${group.leader_phone}`}
                  className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-100 transition shrink-0"
                >
                  📞 {group.leader_phone}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Bus + Travel Info */}
        <div className="grid grid-cols-2 gap-3">
          {bus?.bus_number && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 text-center">
              <p className="text-xs font-semibold text-slate-500 mb-2">🚌 الحافلة</p>
              <p className="text-5xl font-black text-slate-800 leading-none">{bus.bus_number}</p>
              <p className="text-xs text-slate-400 mt-1">رقم الباص</p>
            </div>
          )}

          {(pilgrim.level || pilgrim.room_type || pilgrim.travel_from || pilgrim.travel_to) && (
            <div className={`bg-white rounded-2xl p-4 border border-slate-200 ${!bus?.bus_number ? "col-span-2" : ""}`}>
              <p className="text-xs font-semibold text-slate-500 mb-3">✈️ تفاصيل البرنامج</p>
              <div className="space-y-2 text-sm">
                {pilgrim.level && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">المستوى</span>
                    <span className="font-medium text-slate-800">{pilgrim.level}</span>
                  </div>
                )}
                {pilgrim.room_type && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">نوع الغرفة</span>
                    <span className="font-medium text-slate-800">{pilgrim.room_type}</span>
                  </div>
                )}
                {pilgrim.travel_from && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">تاريخ السفر</span>
                    <span className="font-medium text-slate-800">{String(pilgrim.travel_from)}</span>
                  </div>
                )}
                {pilgrim.travel_to && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">تاريخ العودة</span>
                    <span className="font-medium text-slate-800">{String(pilgrim.travel_to)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {cp?.booking_type && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 text-center col-span-1">
              <p className="text-xs font-semibold text-slate-500 mb-2">⛺ المخيم</p>
              <p className="font-black text-slate-800 text-xl">{cp.booking_type}</p>
            </div>
          )}
        </div>

        {/* Roommates */}
        {roommates.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <p className="font-bold text-slate-800 text-sm">🛏️ زملاء الغرفة ({roommates.length})</p>
            </div>
            <div className="divide-y divide-slate-100">
              {roommates.map((m: any) => (
                <div key={m.pilgrim_id} className="px-4 py-3 flex items-center justify-between">
                  <span className="font-medium text-slate-800 text-sm">{m.full_name}</span>
                  {m.group_number && (
                    <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                      م {m.group_number}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200">
          <p className="text-xs font-semibold text-slate-500 mb-3">📞 أرقام التواصل</p>
          <div className="space-y-2">
            <a
              href="tel:065389222"
              className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 hover:bg-slate-100 transition"
            >
              <span className="text-sm text-slate-700">إدارة الحملة</span>
              <span className="font-bold text-slate-900">065389222</span>
            </a>
            <a
              href="https://wa.me/97165389222"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3 hover:bg-green-100 transition"
            >
              <span className="text-sm text-green-700 font-medium">واتساب الحملة</span>
              <span className="text-green-600 font-bold">تواصل الآن ←</span>
            </a>
            {pilgrim.emergency_contact_name && pilgrim.emergency_contact_phone && (
              <a
                href={`tel:${pilgrim.emergency_contact_phone}`}
                className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-3 hover:bg-red-100 transition"
              >
                <span className="text-sm text-red-700">
                  🆘 {pilgrim.emergency_contact_name}
                </span>
                <span className="font-bold text-red-800">{pilgrim.emergency_contact_phone}</span>
              </a>
            )}
          </div>
        </div>

        {/* Messages */}
        <PilgrimMessages pilgrimId={pilgrimId} initialMessages={messages} />

      </main>
    </div>
  );
}
