import { createClient } from "@/lib/supabase/server";
import { Users, Building2, UserCog, Home, AlertCircle } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get all stats in parallel
  const [
    { count: pilgrimsCount },
    { count: roomsCount },
    { count: groupsCount },
    { count: assignmentsCount },
    { data: occupancy },
  ] = await Promise.all([
    supabase.from("pilgrims").select("*", { count: "exact", head: true }),
    supabase.from("rooms").select("*", { count: "exact", head: true }),
    supabase.from("groups").select("*", { count: "exact", head: true }),
    supabase
      .from("housing_assignments")
      .select("*", { count: "exact", head: true })
      .eq("is_current", true),
    supabase
      .from("v_room_occupancy")
      .select("floor_number, occupied, available, capacity"),
  ]);

  // Floor-level stats
  const floorStats: Record<
    number,
    { occupied: number; capacity: number; rooms: number }
  > = {};
  occupancy?.forEach((r: any) => {
    if (!floorStats[r.floor_number]) {
      floorStats[r.floor_number] = { occupied: 0, capacity: 0, rooms: 0 };
    }
    floorStats[r.floor_number].occupied += r.occupied;
    floorStats[r.floor_number].capacity += r.capacity;
    floorStats[r.floor_number].rooms += 1;
  });

  const unassigned = (pilgrimsCount || 0) - (assignmentsCount || 0);

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          لوحة التحكم
        </h1>
        <p className="text-slate-500 mt-1">
          نظرة عامة على حملة الحج - الفجر للحج والعمرة
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="إجمالي الحجاج"
          value={pilgrimsCount || 0}
          icon={Users}
          color="emerald"
          href="/admin/pilgrims"
        />
        <StatCard
          label="إجمالي الغرف"
          value={roomsCount || 0}
          icon={Home}
          color="primary"
          href="/admin/rooms"
        />
        <StatCard
          label="المجموعات"
          value={groupsCount || 0}
          icon={UserCog}
          color="purple"
          href="/admin/groups"
        />
        <StatCard
          label="حجاج مُسكّنين"
          value={assignmentsCount || 0}
          icon={Building2}
          color="amber"
        />
      </div>

      {/* Unassigned warning */}
      {unassigned > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-900">
              {unassigned} حاج غير مُسكّنين
            </p>
            <p className="text-sm text-amber-700 mt-1">
              يحتاجون تعيين غرفة. يمكنك التسكين من{" "}
              <Link href="/admin/pilgrims" className="underline">
                صفحة الحجاج
              </Link>
              .
            </p>
          </div>
        </div>
      )}

      {/* Floor distribution */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="font-bold text-slate-900 mb-4">
          التوزيع على الطوابق
        </h2>
        <div className="space-y-3">
          {Object.entries(floorStats)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([floor, stats]) => {
              const percent = (stats.occupied / stats.capacity) * 100;
              return (
                <div key={floor}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">
                      الطابق {floor}
                      <span className="text-xs text-slate-500 mr-2">
                        ({stats.rooms} غرفة)
                      </span>
                    </span>
                    <span className="text-slate-600 arabic-num">
                      {stats.occupied} / {stats.capacity}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all"
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  href,
}: {
  label: string;
  value: number;
  icon: any;
  color: string;
  href?: string;
}) {
  const colors: any = {
    emerald: "bg-emerald-50 text-emerald-700",
    primary: "bg-primary-50 text-primary-700",
    purple: "bg-purple-50 text-purple-700",
    amber: "bg-amber-50 text-amber-700",
  };

  const content = (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colors[color]}`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-3xl font-bold text-slate-900 arabic-num">
        {value}
      </div>
      <div className="text-sm text-slate-500 mt-1">{label}</div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
