import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PrintButton from "@/components/PrintButton";

export default async function PermitPage({
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
      `id, full_name, passport_number, national_id, program, room_type, level,
       travel_from, travel_to, permit_number,
       groups(group_number, leader_name, leader_phone)`
    )
    .eq("id", pilgrimId)
    .single();

  if (!pilgrim) notFound();

  const { data: housing } = await supabase
    .from("v_pilgrim_housing")
    .select("hotel_name, hotel_city, floor_name, floor_number, room_number, campaign_name")
    .eq("pilgrim_id", pilgrimId)
    .maybeSingle();

  const { data: busData } = await supabase
    .from("bus_distribution")
    .select("bus_number")
    .eq("passport_number", pilgrim.passport_number)
    .maybeSingle();

  const { data: cp } = await supabase
    .from("campaign_pilgrims")
    .select("ref_number, booking_type, campaign")
    .eq("passport_number", pilgrim.passport_number)
    .maybeSingle();

  const group = pilgrim.groups as any;
  const refNumber = cp?.ref_number || pilgrim.permit_number;

  const today = new Date().toLocaleDateString("ar-AE", {
    day: "2-digit", month: "long", year: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-start py-8 px-4 print:bg-white print:py-0" dir="rtl">

      {/* Print button - hidden on print */}
      <div className="mb-6 flex gap-3 print:hidden">
        <PrintButton />
        <a href={`/pilgrim/${pilgrimId}`}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition">
          ← رجوع
        </a>
      </div>

      {/* Permit Card */}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none print:rounded-none print:max-w-full">

        {/* Header */}
        <div className="bg-emerald-700 text-white px-6 py-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-black">حملة الفجر للحج والعمرة</h1>
              <p className="text-xs text-emerald-200 mt-0.5">دولة الإمارات العربية المتحدة</p>
            </div>
            <div className="text-left">
              <p className="text-xs text-emerald-300">موسم</p>
              <p className="text-2xl font-black">1447هـ</p>
            </div>
          </div>
          <div className="border-t border-emerald-600 pt-3">
            <p className="text-xs text-emerald-300 mb-1">تصريح الحج</p>
            <p className="text-3xl font-black tracking-wider">
              {refNumber || "—"}
            </p>
          </div>
        </div>

        {/* Pilgrim Name */}
        <div className="bg-emerald-50 border-b-2 border-emerald-200 px-6 py-4">
          <p className="text-xs text-emerald-600 font-medium mb-1">اسم الحاج</p>
          <p className="text-2xl font-black text-slate-900">{pilgrim.full_name}</p>
        </div>

        {/* Main Data */}
        <div className="px-6 py-4 space-y-0 divide-y divide-slate-100">
          <Row label="رقم الجواز" value={pilgrim.passport_number} />
          <Row label="رقم الهوية" value={pilgrim.national_id} />
          <Row label="رقم المجموعة" value={group?.group_number} />
          <Row label="مسؤول المجموعة" value={group?.leader_name} />
          <Row label="البرنامج" value={pilgrim.program} />
          <Row label="المستوى" value={pilgrim.level} />
          <Row label="نوع الغرفة" value={pilgrim.room_type} />
          <Row label="تاريخ السفر" value={pilgrim.travel_from ? String(pilgrim.travel_from) : undefined} />
          <Row label="تاريخ العودة" value={pilgrim.travel_to ? String(pilgrim.travel_to) : undefined} />
        </div>

        {/* Housing + Bus */}
        <div className="bg-slate-800 text-white px-6 py-4">
          <p className="text-xs text-slate-400 mb-3 font-medium">بيانات السكن والنقل</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-700 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1">الفندق</p>
              <p className="font-bold text-sm leading-tight">{housing?.hotel_name || "—"}</p>
              {housing?.hotel_city && <p className="text-xs text-slate-400 mt-0.5">{housing.hotel_city}</p>}
            </div>
            <div className="bg-slate-700 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1">الغرفة</p>
              <p className="font-black text-3xl text-emerald-400 leading-none">{housing?.room_number || "—"}</p>
              <p className="text-xs text-slate-400 mt-0.5">{housing?.floor_name || ""}</p>
            </div>
            <div className="bg-slate-700 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1">الحافلة</p>
              <p className="font-black text-3xl text-emerald-400 leading-none">{busData?.bus_number || "—"}</p>
              <p className="text-xs text-slate-400 mt-0.5">رقم الباص</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100">
          <span>تاريخ الإصدار: {today}</span>
          <span>هاتف: 065389222</span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-800">{value || <span className="text-slate-300 font-normal">—</span>}</span>
    </div>
  );
}
