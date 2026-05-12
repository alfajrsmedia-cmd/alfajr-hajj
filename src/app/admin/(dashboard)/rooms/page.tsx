import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Home, Users } from "lucide-react";

export default async function RoomsPage() {
  const supabase = await createClient();

  const { data: rooms } = await supabase
    .from("v_room_occupancy")
    .select("*")
    .order("floor_number")
    .order("room_number");

  // Group rooms by floor
  const byFloor: Record<number, any[]> = {};
  rooms?.forEach((r: any) => {
    if (!byFloor[r.floor_number]) byFloor[r.floor_number] = [];
    byFloor[r.floor_number].push(r);
  });

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          الغرف والتسكين
        </h1>
        <p className="text-slate-500 mt-1 arabic-num">
          {rooms?.length || 0} غرفة موزعة على {Object.keys(byFloor).length}{" "}
          طوابق
        </p>
      </header>

      <div className="space-y-8">
        {Object.entries(byFloor)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([floor, floorRooms]) => (
            <FloorSection
              key={floor}
              floorNumber={parseInt(floor)}
              rooms={floorRooms}
            />
          ))}
      </div>
    </div>
  );
}

function FloorSection({
  floorNumber,
  rooms,
}: {
  floorNumber: number;
  rooms: any[];
}) {
  const totalOccupied = rooms.reduce((s, r) => s + r.occupied, 0);
  const totalCapacity = rooms.reduce((s, r) => s + r.capacity, 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
        <h2 className="font-bold text-slate-900 text-lg">
          الطابق {floorNumber}
        </h2>
        <span className="text-sm text-slate-600 arabic-num">
          {totalOccupied} / {totalCapacity}
        </span>
      </div>

      <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {rooms.map((room) => (
          <Link
            key={room.room_id}
            href={`/admin/rooms/${room.room_id}`}
            className={`p-3 rounded-xl border-2 transition hover:shadow-md ${
              room.occupied === 0
                ? "bg-slate-50 border-slate-200"
                : room.occupied >= room.capacity
                  ? "bg-emerald-50 border-emerald-300"
                  : "bg-amber-50 border-amber-300"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Home className="w-4 h-4 text-slate-600" />
              <span className="font-bold text-slate-900 arabic-num">
                {room.room_number}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-600 arabic-num">
              <Users className="w-3 h-3" />
              {room.occupied} / {room.capacity}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
