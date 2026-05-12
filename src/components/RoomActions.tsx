"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightLeft, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RoomActions({
  pilgrimId,
  roomId,
}: {
  pilgrimId: number;
  roomId: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleRemove() {
    if (!confirm("هل تريد إزالة هذا الحاج من الغرفة؟")) return;

    setBusy(true);
    const supabase = createClient();
    await supabase
      .from("housing_assignments")
      .update({ is_current: false })
      .eq("pilgrim_id", pilgrimId)
      .eq("room_id", roomId)
      .eq("is_current", true);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleRemove}
        disabled={busy}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
        title="إزالة من الغرفة"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
