import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Building2,
  Users,
  MapPin,
  Phone,
  Home,
  ArrowRight,
  Printer,
} from "lucide-react";
import PilgrimQR from "@/components/PilgrimQR";

export default async function PilgrimPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: pilgrim, error } = await supabase
    .from("v_pilgrim_housing")
    .select("*")
    .eq("pilgrim_id", parseInt(id))
    .single();

  if (error || !pilgrim) {
    notFound();
  }

  // Get roommates
  const { data: roommates } = await supabase
    .from("v_pilgrim_housing")
    .select("pilgrim_id, full_name, group_number")
    .eq("room_number", pilgrim.room_number)
    .eq("floor_number", pilgrim.floor_number)
    .neq("pilgrim_id", pilgrim.pilgrim_id);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-emerald-700 text-white print:bg-white print:text-black no-print:shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/pilgrim/login"
            className="flex items-center gap-2 hover:opacity-80 no-print"
          >
            <ArrowRight className="w-5 h-5" />
            <span>بحث عن حاج آخر</span>
          </Link>
          <div className="text-center flex-1">
            <h1 className="text-lg font-bold">الفجر للحج والعمرة</h1>
            <p className="text-xs opacity-90">
              دولة الإمارات العربية المتحدة
            </p>
          </div>
          <button
            onClick={() => {
              if (typeof window !== "undefined") window.print();
            }}
            className="hidden md:flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-sm no-print"
          >
            <Printer className="w-4 h-4" />
            طباعة
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 py-8">
        {/* Main Info Card */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-6">
          <div className="bg-gradient-to-l from-emerald-600 to-emerald-700 text-white p-6 print:bg-emerald-700">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-xs opacity-80 mb-1">اسم الحاج</p>
                <h2 className="text-2xl md:text-3xl font-bold">
                  {pilgrim.full_name}
                </h2>
                {pilgrim.group_number && (
                  <p className="mt-2 text-emerald-100">
                    مجموعة رقم: {pilgrim.group_number}
                  </p>
                )}
              </div>
              <div className="bg-white p-2 rounded-lg">
                <PilgrimQR
                  data={JSON.stringify({
                    id: pilgrim.pilgrim_id,
                    name: pilgrim.full_name,
                    group: pilgrim.group_number,
                    room: pilgrim.room_number,
                    floor: pilgrim.floor_number,
                  })}
                />
              </div>
            </div>
          </div>

          <div className="p-6 grid md:grid-cols-2 gap-4">
            <InfoBox
              icon={<Building2 className="w-5 h-5" />}
              label="الفندق"
              value={pilgrim.hotel_name || "—"}
              sub={pilgrim.hotel_city}
            />
            <InfoBox
              icon={<MapPin className="w-5 h-5" />}
              label="الطابق"
              value={pilgrim.floor_name || "—"}
              sub={`الطابق رقم ${pilgrim.floor_number}`}
            />
            <InfoBox
              icon={<Home className="w-5 h-5" />}
              label="رقم الغرفة"
              value={pilgrim.room_number || "—"}
              sub={`السعة: ${pilgrim.room_capacity || "—"} أشخاص`}
              highlight
            />
            <InfoBox
              icon={<Users className="w-5 h-5" />}
              label="المجموعة"
              value={
                pilgrim.group_number
                  ? `رقم ${pilgrim.group_number}`
                  : "غير محدد"
              }
              sub={pilgrim.group_name || ""}
            />
          </div>
        </div>

        {/* Roommates */}
        {roommates && roommates.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-6">
            <div className="bg-slate-50 border-b border-slate-200 p-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                المرافقين في الغرفة ({roommates.length})
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {roommates.map((mate: any) => (
                <div
                  key={mate.pilgrim_id}
                  className="p-4 flex items-center justify-between"
                >
                  <span className="font-medium text-slate-900">
                    {mate.full_name}
                  </span>
                  {mate.group_number && (
                    <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded">
                      مجموعة {mate.group_number}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Campaign Info */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center text-sm text-emerald-900">
          <p className="font-medium">
            {pilgrim.campaign_name || "حملة الفجر للحج والعمرة 2026"}
          </p>
          <p className="text-xs text-emerald-700 mt-1">
            للاستفسار: 065389222
          </p>
        </div>
      </main>
    </div>
  );
}

function InfoBox({
  icon,
  label,
  value,
  sub,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string | null;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-xl ${
        highlight
          ? "bg-emerald-50 border-2 border-emerald-300"
          : "bg-slate-50 border border-slate-200"
      }`}
    >
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <div
        className={`text-xl font-bold ${
          highlight ? "text-emerald-700" : "text-slate-900"
        }`}
      >
        {value}
      </div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}
