import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Users, Home, Building2 } from "lucide-react";
import RoomActions from "@/components/RoomActions";

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const roomId = parseInt(id);

  // Get room details
  const { data: room } = await supabase
    .from("rooms")
    .select(
      `
      id,
      room_number,
      capacity,
      room_type,
      floors!inner(id, floor_number, floor_name, hotels!inner(name))
    `
    )
    .eq("id", roomId)
    .single();

  if (!room) notFound();

  // Get occupants
  const { data: occupants } = await supabase
    .from("v_pilgrim_housing")
    .select("pilgrim_id, full_name, group_number, phone, passport_number")
    .eq("room_number", room.room_number)
    .eq("floor_number", (room.floors as any).floor_number);

  const floorData = room.floors as any;
  const occupied = occupants?.length || 0;
  const available = room.capacity - occupied;

  return (
    <div>
      <Link
        href="/admin/rooms"
        className="inline-flex items-center text-emerald-700 mb-4 hover:underline text-sm"
      >
        <ArrowRight className="w-4 h-4 ml-1" />
        رجوع لقائمة الغرف
      </Link>

      <header className="mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              غرفة {room.room_number}
            </h1>
            <div className="text-slate-500 mt-1 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              {floorData.hotels.name} - {floorData.floor_name}
            </div>
          </div>
          <div className="flex gap-2">
            <Stat label="السعة" value={room.capacity} />
            <Stat label="مُسكّن" value={occupied} color="emerald" />
            <Stat label="متاح" value={available} color="amber" />
          </div>
        </div>
      </header>

      {/* Occupants */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
        <div className="bg-slate-50 border-b border-slate-200 p-4">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            الساكنون في الغرفة
          </h2>
        </div>
        {occupants && occupants.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {occupants.map((o: any) => (
              <div
                key={o.pilgrim_id}
                className="p-4 flex items-center justify-between hover:bg-slate-50"
              >
                <div>
                  <Link
                    href={`/admin/pilgrims/${o.pilgrim_id}`}
                    className="font-medium text-slate-900 hover:text-emerald-700"
                  >
                    {o.full_name}
                  </Link>
                  <div className="text-xs text-slate-500 mt-1 arabic-num">
                    {o.group_number && (
                      <span>مجموعة {o.group_number} • </span>
                    )}
                    {o.passport_number || o.phone || "—"}
                  </div>
                </div>
                <RoomActions pilgrimId={o.pilgrim_id} roomId={roomId} />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400">
            <Home className="w-12 h-12 mx-auto mb-2 opacity-30" />
            لا يوجد ساكنون في هذه الغرفة
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  color = "slate",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  const colors: any = {
    slate: "bg-slate-100 text-slate-700",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
  };
  return (
    <div className={`${colors[color]} px-4 py-2 rounded-lg text-center`}>
      <div className="text-xl font-bold arabic-num">{value}</div>
      <div className="text-xs">{label}</div>
    </div>
  );
}
