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

  // Get floor info
  const { data: floorData } = await supabase
    .from("floors")
    .select("id, floor_name, floor_number, hotels(name)")
    .eq("floor_number", floorNum)
    .single();

  if (!floorData) notFound();

  // Get all rooms with occupants
  const { data: rooms } = await supabase
    .from("rooms")
    .select("id, room_number, capacity")
    .eq("floor_id", floorData.id)
    .order("room_number");

  const { data: assignments } = await supabase
    .from("v_pilgrim_housing")
    .select("pilgrim_id, full_name, group_number, room_number")
    .eq("floor_number", floorNum);

  // Group occupants by room
  const occupantsByRoom: Record<string, any[]> = {};
  assignments?.forEach((a: any) => {
    if (!occupantsByRoom[a.room_number]) occupantsByRoom[a.room_number] = [];
    occupantsByRoom[a.room_number].push(a);
  });

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="bg-white min-h-screen" dir="rtl">
      <PrintButton />

      {rooms?.map((room, idx) => {
        const occupants = occupantsByRoom[room.room_number] || [];
        return (
          <div
            key={room.id}
            className="print-page p-12 min-h-[297mm] page-break"
            style={{ pageBreakAfter: "always" }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-xl font-bold mb-1">الفجر للحج والعمرة</h1>
              <p className="text-sm">دولة الإمارات العربية المتحدة</p>
              <p className="text-xs">هاتف: 065389222 - فاكس: 065387077</p>
            </div>

            <div className="text-center mb-4">
              <p className="text-sm font-bold">ك ف ال</p>
            </div>

            {/* Room Info Bar */}
            <div className="border-2 border-slate-800 grid grid-cols-3 mb-6">
              <div className="p-3 text-center font-bold border-l-2 border-slate-800 arabic-num text-lg">
                {room.room_number}
              </div>
              <div className="p-3 text-center font-bold border-l-2 border-slate-800">
                {(floorData.hotels as any)?.name}-{floorData.floor_name}
              </div>
              <div className="p-3 text-center text-sm">
                الدور / الشقة / الغرفة
              </div>
            </div>

            {/* Table Header */}
            <table className="w-full border-2 border-slate-800">
              <thead>
                <tr className="border-b-2 border-slate-800">
                  <th className="p-2 border-l-2 border-slate-800 text-sm w-24">
                    رقم المجموعة
                  </th>
                  <th className="p-2 border-l-2 border-slate-800 text-sm">
                    اسم الحاج
                  </th>
                  <th className="p-2 text-sm w-16">م.</th>
                </tr>
              </thead>
              <tbody>
                {occupants.map((o: any, i: number) => (
                  <tr key={o.pilgrim_id} className="border-b border-slate-300">
                    <td className="p-2 text-center border-l-2 border-slate-800 arabic-num">
                      {o.group_number || "—"}
                    </td>
                    <td className="p-2 text-right border-l-2 border-slate-800">
                      {o.full_name}
                    </td>
                    <td className="p-2 text-center arabic-num">{i + 1}</td>
                  </tr>
                ))}
                {/* Empty rows to fill capacity */}
                {Array.from({
                  length: Math.max(0, room.capacity - occupants.length),
                }).map((_, i) => (
                  <tr key={`empty-${i}`} className="border-b border-slate-300">
                    <td className="p-2 border-l-2 border-slate-800 h-8"></td>
                    <td className="p-2 border-l-2 border-slate-800"></td>
                    <td className="p-2 text-center text-slate-400 arabic-num">
                      {occupants.length + i + 1}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer */}
            <div className="flex justify-between text-xs mt-12">
              <span>
                صفحة {idx + 1} من {rooms.length}
              </span>
              <span className="arabic-num">{today}</span>
            </div>
          </div>
        );
      })}

      <style>{`
        @media print {
          .page-break {
            page-break-after: always;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
