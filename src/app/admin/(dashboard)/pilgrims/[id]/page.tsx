"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, User, Home, Users, Bus, ShoppingCart, Phone, CreditCard, Passport, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function PilgrimProfilePage() {
  const { id } = useParams();
  const pilgrimId = parseInt(id as string);
  const supabase = createClient();

  const [pilgrim, setPilgrim]   = useState<any>(null);
  const [housing, setHousing]   = useState<any>(null);
  const [bus, setBus]           = useState<any>(null);
  const [golf, setGolf]         = useState<any[]>([]);
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => { load() }, [pilgrimId]);

  async function load() {
    setLoading(true);

    const { data: p } = await supabase
      .from("pilgrims")
      .select("*, groups(group_number, group_name, leader_name, leader_phone), campaigns(name, hijri_year, year)")
      .eq("id", pilgrimId)
      .single();

    if (!p) { setLoading(false); return; }
    setPilgrim(p);

    const passport = p.passport_number?.trim();
    const natId    = p.national_id?.trim();

    const [
      { data: h },
      { data: b },
      { data: g },
      { data: c },
    ] = await Promise.all([
      supabase.from("v_pilgrim_housing").select("*").eq("pilgrim_id", pilgrimId).maybeSingle(),
      supabase.from("bus_distribution").select("*")
        .or(`passport_number.eq.${passport},national_id.eq.${natId}`)
        .maybeSingle(),
      supabase.from("golf_cart_bookings").select("*")
        .or(`passport_number.eq.${passport},national_id.eq.${natId}`),
      supabase.from("campaign_pilgrims").select("*")
        .or(`passport_number.eq.${passport},national_id.eq.${natId}`)
        .maybeSingle(),
    ]);

    setHousing(h);
    setBus(b);
    setGolf(g || []);
    setCampaign(c);
    setLoading(false);
  }

  if (loading) return <div className="py-16 text-center text-slate-400">جاري التحميل...</div>;
  if (!pilgrim) return <div className="py-16 text-center text-red-500">لم يتم العثور على الحاج</div>;

  return (
    <div className="p-6 max-w-5xl" dir="rtl">
      <Link href="/admin/pilgrims" className="inline-flex items-center text-emerald-700 mb-5 hover:underline text-sm gap-1">
        <ArrowRight className="w-4 h-4" />
        رجوع للقائمة
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-5 flex items-start gap-5">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl font-bold text-emerald-700">{pilgrim.full_name[0]}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-slate-900">{pilgrim.full_name}</h1>
          <div className="flex flex-wrap gap-3 mt-2">
            {pilgrim.campaigns?.name && <Badge color="slate">{pilgrim.campaigns.name}</Badge>}
            {pilgrim.program && <Badge color="emerald">{pilgrim.program}</Badge>}
            {pilgrim.groups?.group_number && <Badge color="amber">مجموعة {pilgrim.groups.group_number}</Badge>}
            {housing?.room_number && <Badge color="blue">غرفة {housing.room_number}</Badge>}
            {housing?.floor_name && <Badge color="purple">{housing.floor_name}</Badge>}
            {bus?.bus_number && <Badge color="rose">باص {bus.bus_number}</Badge>}
          </div>
        </div>
        <Link
          href={`/admin/pilgrims/${pilgrimId}/edit`}
          className="flex-shrink-0 px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition text-slate-600"
        >
          تعديل
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-5">

        {/* البيانات الشخصية */}
        <Section title="البيانات الشخصية" icon={<User className="w-4 h-4" />}>
          <Row label="الحملة"          value={pilgrim.campaigns?.name} />
          <Row label="السنة الهجرية"   value={pilgrim.campaigns?.hijri_year} />
          <Row label="الاسم الكامل"    value={pilgrim.full_name} />
          <Row label="رقم الهوية"      value={pilgrim.national_id} />
          <Row label="رقم الجواز"      value={pilgrim.passport_number} mono />
          <Row label="رقم الهاتف"      value={pilgrim.phone} />
          <Row label="الجنس"           value={pilgrim.gender === 'male' ? 'ذكر' : pilgrim.gender === 'female' ? 'أنثى' : null} />
          <Row label="الجنسية"         value={pilgrim.nationality} />
          <Row label="تاريخ الميلاد"   value={pilgrim.birth_date} />
          <Row label="البريد الإلكتروني" value={pilgrim.email} />
          <Row label="البرنامج"        value={pilgrim.program} />
          <Row label="نوع الغرفة"      value={pilgrim.room_type} />
          <Row label="المستوى"         value={pilgrim.level} />
          <Row label="تاريخ السفر ذهاب" value={pilgrim.travel_from} />
          <Row label="تاريخ السفر عودة" value={pilgrim.travel_to} />
          <Row label="رقم التصريح"     value={pilgrim.permit_number} />
          {pilgrim.notes && <Row label="ملاحظات" value={pilgrim.notes} />}
        </Section>

        {/* الطوارئ والصحة */}
        <Section title="الطوارئ والصحة" icon={<AlertCircle className="w-4 h-4" />}>
          <Row label="جهة اتصال الطوارئ" value={pilgrim.emergency_contact_name} />
          <Row label="هاتف الطوارئ"      value={pilgrim.emergency_contact_phone} />
          <Row label="ملاحظات طبية"      value={pilgrim.medical_notes} />
          <Row label="احتياجات خاصة"     value={pilgrim.special_needs} />
        </Section>

        {/* السكن */}
        <Section title="السكن" icon={<Home className="w-4 h-4" />}>
          {housing ? <>
            <Row label="الفندق"   value={housing.hotel_name} />
            <Row label="المدينة"  value={housing.hotel_city} />
            <Row label="الطابق"   value={housing.floor_name} />
            <Row label="رقم الغرفة" value={housing.room_number} />
            <Row label="سعة الغرفة" value={housing.room_capacity ? `${housing.room_capacity} أشخاص` : null} />
            <Row label="تاريخ الدخول" value={housing.check_in_date} />
            <Row label="تاريخ الخروج" value={housing.check_out_date} />
          </> : <Empty text="لا يوجد تسكين مسجل" />}
        </Section>

        {/* المجموعة */}
        <Section title="المجموعة" icon={<Users className="w-4 h-4" />}>
          {pilgrim.groups ? <>
            <Row label="رقم المجموعة"  value={pilgrim.groups.group_number} />
            <Row label="اسم المجموعة"  value={pilgrim.groups.group_name} />
            <Row label="مسؤول المجموعة" value={pilgrim.groups.leader_name} />
            <Row label="هاتف المسؤول"  value={pilgrim.groups.leader_phone} />
          </> : <Empty text="لا توجد مجموعة مسجلة" />}
        </Section>

        {/* الباص */}
        <Section title="توزيع الباصات" icon={<Bus className="w-4 h-4" />}>
          {bus ? <>
            <Row label="رقم الباص"    value={bus.bus_number} />
            <Row label="رقم المجموعة" value={bus.group_number} />
            <Row label="الحملة"       value={bus.campaign} />
          </> : <Empty text="لا يوجد توزيع باص مسجل" />}
        </Section>

        {/* عربات القولف */}
        <Section title="عربات القولف" icon={<ShoppingCart className="w-4 h-4" />}>
          {golf.length === 0 ? <Empty text="لا يوجد حجز عربة قولف" /> : golf.map((g, i) => (
            <div key={i} className={i > 0 ? "mt-3 pt-3 border-t border-slate-100" : ""}>
              <Row label="نوع الخدمة"    value={g.service_type} />
              <Row label="الخدمة"        value={g.service} />
              <Row label="البرنامج"      value={g.program} />
              <Row label="تاريخ السفر"   value={g.travel_date} />
              <Row label="طريقة السداد"  value={g.payment_method} />
              <Row label="المبلغ المدفوع" value={g.amount_paid ? `${g.amount_paid} ر.س` : null} />
            </div>
          ))}
        </Section>

      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50">
        <span className="text-emerald-600">{icon}</span>
        <h2 className="font-semibold text-slate-700 text-sm">{title}</h2>
      </div>
      <div className="divide-y divide-slate-50 px-5 py-2">{children}</div>
    </div>
  );
}

function Row({ label, value, mono = false }: { label: string; value: any; mono?: boolean }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-start justify-between py-2 gap-4">
      <span className="text-xs text-slate-400 flex-shrink-0 mt-0.5">{label}</span>
      <span className={`text-sm text-slate-800 text-left ${mono ? "font-mono" : "font-medium"}`}>{String(value)}</span>
    </div>
  );
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber:   "bg-amber-50 text-amber-700 border-amber-200",
    blue:    "bg-blue-50 text-blue-700 border-blue-200",
    purple:  "bg-purple-50 text-purple-700 border-purple-200",
    rose:    "bg-rose-50 text-rose-700 border-rose-200",
    slate:   "bg-slate-100 text-slate-700 border-slate-200",
  };
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${colors[color]}`}>{children}</span>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-xs text-slate-400 py-3 text-center">{text}</p>;
}
