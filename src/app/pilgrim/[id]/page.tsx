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
    <div className="min-h-screen bg-slate-100" dir="rtl">
      {/* Header */}
      <header className="bg-emerald-700 text-white">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/pilgrim/login" className="text-sm text-emerald-200 hover:text-white flex items-center gap-1 transition">
            ← بحث آخر
          </Link>
          <p className="font-bold text-sm">حملة الفجر للحج والعمرة</p>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* === Name Card === */}
        <div className="bg-emerald-700 rounded-2xl overflow-hidden shadow-md">
          <div className="p-5 flex items-start gap-4">
            <div className="bg-white rounded-xl p-1.5 shrink-0 shadow">
              <PilgrimQR
                data={JSON.stringify({
                  id: pilgrimId,
                  name: pilgrim.full_name,
                  ref: cp?.ref_number,
                  group: group?.group_number,
                })}
              />
            </div>
            <div className="flex-1 min-w-0">
              {cp?.ref_number && (
                <p className="text-xs text-emerald-300 mb-1">
                  رقم التصريح: <span className="font-bold text-emerald-100">{cp.ref_number}</span>
                </p>
              )}
              <h2 className="text-xl font-black text-white leading-tight">{pilgrim.full_name}</h2>
              {group?.group_number && (
                <p className="text-emerald-200 text-sm mt-1">مجموعة رقم: {group.group_number}</p>
              )}
              {pilgrim.program && (
                <span className="inline-block mt-2 text-xs bg-emerald-600 text-emerald-100 px-2.5 py-1 rounded-full">
                  ✈️ {pilgrim.program}
                </span>
              )}
            </div>
          </div>

          {/* Quick stats bar */}
          <div className="grid grid-cols-4 border-t border-emerald-600 divide-x divide-emerald-600 text-center">
            <div className="py-3 px-2">
              <p className="text-emerald-300 text-xs mb-0.5">الغرفة</p>
              <p className="text-white font-black text-lg leading-none">
                {housing?.room_number || "—"}
              </p>
            </div>
            <div className="py-3 px-2">
              <p className="text-emerald-300 text-xs mb-0.5">الباص</p>
              <p className="text-white font-black text-lg leading-none">
                {bus?.bus_number || "—"}
              </p>
            </div>
            <div className="py-3 px-2">
              <p className="text-emerald-300 text-xs mb-0.5">المجموعة</p>
              <p className="text-white font-black text-lg leading-none">
                {group?.group_number || "—"}
              </p>
            </div>
            <div className="py-3 px-2">
              <p className="text-emerald-300 text-xs mb-0.5">الطابق</p>
              <p className="text-white font-black text-lg leading-none">
                {housing?.floor_number || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* === السكن === */}
        <Section title="🏨 بيانات السكن">
          <InfoRow label="الفندق" value={housing?.hotel_name} />
          <InfoRow label="المدينة" value={housing?.hotel_city} />
          <InfoRow label="الطابق" value={housing?.floor_name} />
          <InfoRow label="رقم الغرفة" value={housing?.room_number} highlight />
          <InfoRow label="سعة الغرفة" value={housing?.room_capacity ? `${housing.room_capacity} أشخاص` : undefined} />
        </Section>

        {/* === المجموعة === */}
        <Section title="👥 المجموعة والمسؤول">
          <InfoRow label="رقم المجموعة" value={group?.group_number} />
          <InfoRow label="مسؤول المجموعة" value={group?.leader_name} />
          {group?.leader_phone ? (
            <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
              <span className="text-sm text-slate-500">هاتف المسؤول</span>
              <a href={`tel:${group.leader_phone}`}
                className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg font-bold text-sm hover:bg-emerald-100 transition">
                📞 {group.leader_phone}
              </a>
            </div>
          ) : (
            <InfoRow label="هاتف المسؤول" value={undefined} />
          )}
        </Section>

        {/* === الحافلة === */}
        <Section title="🚌 الحافلة">
          {bus?.bus_number ? (
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-slate-500">رقم الحافلة</span>
              <span className="text-4xl font-black text-slate-800">{bus.bus_number}</span>
            </div>
          ) : (
            <InfoRow label="رقم الحافلة" value={undefined} />
          )}
          <InfoRow label="موعد التحرك" value={undefined} />
          <InfoRow label="نقطة التجمع" value={undefined} />
        </Section>

        {/* === البرنامج === */}
        <Section title="✈️ تفاصيل البرنامج والسفر">
          <InfoRow label="البرنامج" value={pilgrim.program} />
          <InfoRow label="المستوى" value={pilgrim.level} />
          <InfoRow label="نوع الغرفة" value={pilgrim.room_type} />
          <InfoRow label="تاريخ السفر" value={pilgrim.travel_from ? String(pilgrim.travel_from) : undefined} />
          <InfoRow label="تاريخ العودة" value={pilgrim.travel_to ? String(pilgrim.travel_to) : undefined} />
          <InfoRow label="درجة السفر" value={undefined} />
          <InfoRow label="شركة الطيران" value={undefined} />
        </Section>

        {/* === المخيمات === */}
        <Section title="⛺ المخيمات">
          <InfoRow label="نوع التسكين" value={cp?.booking_type} />
          <InfoRow label="مخيم منى" value={undefined} />
          <InfoRow label="مخيم عرفات" value={undefined} />
          <InfoRow label="مخيم مزدلفة" value={undefined} />
          <p className="text-xs text-slate-400 pt-2 text-center">سيتم الإعلان عن تفاصيل المخيمات لاحقاً</p>
        </Section>

        {/* === زملاء الغرفة === */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="font-bold text-slate-800 text-sm">🛏️ زملاء الغرفة</p>
            <span className="text-xs text-slate-400">
              {roommates.length > 0 ? `${roommates.length} أشخاص` : "لا يوجد بيانات"}
            </span>
          </div>
          {roommates.length > 0 ? (
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
          ) : (
            <p className="text-center text-sm text-slate-400 py-6">لم يُحدَّد زملاء الغرفة بعد</p>
          )}
        </div>

        {/* === التواصل === */}
        <Section title="📞 أرقام التواصل والطوارئ">
          <div className="space-y-2 pt-1">
            <a href="tel:065389222"
              className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 hover:bg-slate-100 transition border border-slate-200">
              <span className="text-sm text-slate-700 font-medium">📱 إدارة الحملة</span>
              <span className="font-black text-slate-900 text-lg">065389222</span>
            </a>
            <a href="https://wa.me/97165389222" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between bg-green-50 rounded-xl px-4 py-3 hover:bg-green-100 transition border border-green-200">
              <span className="text-sm text-green-700 font-medium">💬 واتساب الحملة</span>
              <span className="font-bold text-green-700">تواصل الآن ←</span>
            </a>
            {pilgrim.emergency_contact_name && pilgrim.emergency_contact_phone ? (
              <a href={`tel:${pilgrim.emergency_contact_phone}`}
                className="flex items-center justify-between bg-red-50 rounded-xl px-4 py-3 hover:bg-red-100 transition border border-red-200">
                <span className="text-sm text-red-700 font-medium">🆘 {pilgrim.emergency_contact_name}</span>
                <span className="font-bold text-red-800">{pilgrim.emergency_contact_phone}</span>
              </a>
            ) : (
              <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
                <span className="text-sm text-slate-400">🆘 جهة الطوارئ</span>
                <span className="text-sm text-slate-300">غير محدد</span>
              </div>
            )}
          </div>
        </Section>

        {/* === الملاحظات === */}
        <PilgrimMessages pilgrimId={pilgrimId} initialMessages={messages} />

      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100">
        <p className="font-bold text-slate-800 text-sm">{title}</p>
      </div>
      <div className="px-4 py-1 divide-y divide-slate-100">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, highlight = false }: { label: string; value?: string | number | null; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-slate-500">{label}</span>
      {value ? (
        <span className={`text-sm font-semibold ${highlight ? "text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 text-base font-black" : "text-slate-800"}`}>
          {value}
        </span>
      ) : (
        <span className="text-sm text-slate-300">غير متوفر</span>
      )}
    </div>
  );
}
