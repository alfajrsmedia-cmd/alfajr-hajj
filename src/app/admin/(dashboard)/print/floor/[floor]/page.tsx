import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import PrintButton from "@/components/PrintButton";

export default async function PrintFloorPage({
  params,
}: {
  params: Promise<{ floor: string }>;
}) {
  const { floor } = await params;
  const floorNum = parseInt(floor);
  const supabase = await createClient();

  const { data: floorData } = await supabase
    .from("floors")
    .select("id, floor_name, floor_number, hotels(name)")
    .eq("floor_number", floorNum)
    .single();

  if (!floorData) notFound();

  const { data: rooms } = await supabase
    .from("rooms")
    .select("id, room_number, capacity")
    .eq("floor_id", floorData.id)
    .order("room_number");

  const { data: assignments } = await supabase
    .from("v_pilgrim_housing")
    .select("pilgrim_id, full_name, group_number, room_number")
    .eq("floor_number", floorNum);

  const occupantsByRoom: Record<string, any[]> = {};
  assignments?.forEach((a: any) => {
    if (!occupantsByRoom[a.room_number]) occupantsByRoom[a.room_number] = [];
    occupantsByRoom[a.room_number].push(a);
  });

  const today = new Date().toLocaleDateString("ar-AE", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const hotelName = (floorData.hotels as any)?.name || "";
  const totalPilgrims = assignments?.length || 0;
  const totalRooms = rooms?.length || 0;

  return (
    <div className="bg-white" dir="rtl">
      <PrintButton />

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; }
          .print-page { page-break-after: always; }
          .print-page:last-child { page-break-after: avoid; }
        }
        @page { size: A4; margin: 12mm; }
        .room-card { break-inside: avoid; }
      `}</style>

      {/* Cover Page */}
      <div className="print-page min-h-screen flex flex-col" style={{padding: '20mm'}}>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-black text-slate-800 mb-2">حملة الفجر للحج والعمرة</h1>
            <p className="text-lg text-slate-500">دولة الإمارات العربية المتحدة</p>
            <p className="text-sm text-slate-400 mt-1">هاتف: 065389222  |  فاكس: 065387077</p>
          </div>

          <div className="w-24 h-1 bg-emerald-600 rounded mb-8"></div>

          <h2 className="text-3xl font-bold text-emerald-700 mb-2">كشف التسكين</h2>
          <p className="text-xl text-slate-700 font-semibold">{hotelName} — {floorData.floor_name}</p>

          <div className="mt-12 grid grid-cols-3 gap-8 text-center">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <p className="text-4xl font-black text-emerald-700">{totalRooms}</p>
              <p className="text-sm text-slate-500 mt-1">غرفة</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <p className="text-4xl font-black text-emerald-700">{totalPilgrims}</p>
              <p className="text-sm text-slate-500 mt-1">حاج</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <p className="text-4xl font-black text-emerald-700">1447</p>
              <p className="text-sm text-slate-500 mt-1">هـ</p>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-slate-400 mt-8">
          <p>تاريخ الطباعة: {today}</p>
        </div>
      </div>

      {/* Rooms — 2 per page */}
      {rooms && (() => {
        const pages: typeof rooms[] = [];
        for (let i = 0; i < rooms.length; i += 2) {
          pages.push(rooms.slice(i, i + 2));
        }
        return pages.map((pageRooms, pageIdx) => (
          <div key={pageIdx} className="print-page" style={{padding: '12mm', minHeight: '257mm'}}>
            {/* Page Header */}
            <div className="flex items-center justify-between border-b-2 border-emerald-700 pb-3 mb-6">
              <div>
                <p className="text-xs text-slate-400">حملة الفجر للحج والعمرة</p>
                <p className="font-bold text-slate-700">{hotelName} — {floorData.floor_name}</p>
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-400">{today}</p>
                <p className="text-xs text-slate-400">صفحة {pageIdx + 2} من {pages.length + 1}</p>
              </div>
            </div>

            {/* Room Cards */}
            <div className="flex flex-col gap-6">
              {pageRooms.map((room) => {
                const occupants = occupantsByRoom[room.room_number] || [];
                const emptySlots = Math.max(0, room.capacity - occupants.length);
                return (
                  <div key={room.id} className="room-card border-2 border-slate-800 rounded-lg overflow-hidden">
                    {/* Room Header */}
                    <div className="bg-slate-800 text-white grid grid-cols-3 text-center">
                      <div className="py-2 px-3 text-2xl font-black border-l border-slate-600">
                        {room.room_number}
                      </div>
                      <div className="py-2 px-3 font-bold text-sm flex items-center justify-center border-l border-slate-600">
                        {hotelName} — {floorData.floor_name}
                      </div>
                      <div className="py-2 px-3 text-xs flex flex-col items-center justify-center text-slate-300">
                        <span>سعة الغرفة</span>
                        <span className="text-white font-bold text-lg">{room.capacity}</span>
                      </div>
                    </div>

                    {/* Occupants Table */}
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-100 border-b-2 border-slate-800">
                          <th className="py-2 px-3 text-center border-l-2 border-slate-800 w-12 text-slate-600">م</th>
                          <th className="py-2 px-3 text-right border-l-2 border-slate-800 text-slate-600">اسم الحاج</th>
                          <th className="py-2 px-3 text-center w-28 text-slate-600">رقم المجموعة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {occupants.map((o: any, i: number) => (
                          <tr key={o.pilgrim_id} className={`border-b border-slate-200 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                            <td className="py-2.5 px-3 text-center border-l-2 border-slate-800 font-bold text-slate-500">{i + 1}</td>
                            <td className="py-2.5 px-3 text-right border-l-2 border-slate-800 font-medium text-slate-800">{o.full_name}</td>
                            <td className="py-2.5 px-3 text-center">
                              {o.group_number
                                ? <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">{o.group_number}</span>
                                : <span className="text-slate-300">—</span>}
                            </td>
                          </tr>
                        ))}
                        {Array.from({ length: emptySlots }).map((_, i) => (
                          <tr key={`empty-${i}`} className="border-b border-slate-100">
                            <td className="py-3 px-3 border-l-2 border-slate-800 text-center text-slate-300">{occupants.length + i + 1}</td>
                            <td className="py-3 px-3 border-l-2 border-slate-800"></td>
                            <td className="py-3 px-3"></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Room Footer */}
                    <div className="bg-slate-50 border-t-2 border-slate-800 px-4 py-2 flex justify-between text-xs text-slate-500">
                      <span>عدد المسجّلين: <strong>{occupants.length}</strong></span>
                      <span>الأماكن الشاغرة: <strong>{emptySlots}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ));
      })()}
    </div>
  );
}
