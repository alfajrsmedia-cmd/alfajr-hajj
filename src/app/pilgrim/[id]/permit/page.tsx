import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
    .select("id, full_name, passport_number, national_id, permit_photo_path")
    .eq("id", pilgrimId)
    .single();

  if (!pilgrim) notFound();

  // If there's an actual permit file, redirect directly to it
  if (pilgrim.permit_photo_path) {
    const url = `https://gnsdsisqsltxoujfslvf.supabase.co/storage/v1/object/public/pilgrim-docs/${pilgrim.permit_photo_path}`;
    redirect(url);
  }

  // Fallback: no permit file uploaded yet
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center gap-4 p-8" dir="rtl">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        <p className="text-6xl mb-4">📄</p>
        <h1 className="text-xl font-bold text-slate-800 mb-2">{pilgrim.full_name}</h1>
        <p className="text-slate-500 text-sm">لم يتم رفع ملف التصريح بعد</p>
        <a
          href={`/pilgrim/${pilgrimId}`}
          className="inline-block mt-6 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition"
        >
          ← رجوع
        </a>
      </div>
    </div>
  );
}
