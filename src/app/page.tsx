import Link from "next/link";
import { Building2, Users, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-primary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">ف</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-emerald-900">
                الفجر للحج والعمرة
              </h1>
              <p className="text-xs text-slate-500">
                دولة الإمارات العربية المتحدة
              </p>
            </div>
          </div>
          <div className="text-sm text-slate-600">
            <span>هاتف: 065389222</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            منصة إدارة تسكين الحجاج
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            نظام متكامل لإدارة بيانات الحجاج، توزيع الغرف، ومتابعة المجموعات
            في حملة حج 1447هـ - 2026م
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 max-w-4xl mx-auto">
          <StatCard label="حاج" value="739" />
          <StatCard label="مجموعة" value="223" />
          <StatCard label="غرفة" value="293" />
          <StatCard label="طوابق" value="6" />
        </div>

        {/* Login Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Link
            href="/pilgrim/login"
            className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-emerald-200 group"
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition">
              <Users className="w-8 h-8 text-emerald-700" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              بوابة الحاج
            </h3>
            <p className="text-slate-600 mb-4">
              ادخل برقم جوازك للاطلاع على بيانات السكن، رقم الغرفة، الطابق،
              ومجموعتك
            </p>
            <span className="inline-flex items-center text-emerald-700 font-medium">
              تسجيل الدخول ←
            </span>
          </Link>

          <Link
            href="/admin/login"
            className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-primary-200 group"
          >
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary-200 transition">
              <Shield className="w-8 h-8 text-primary-700" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              لوحة الإدارة
            </h3>
            <p className="text-slate-600 mb-4">
              للمشرفين والموظفين - إدارة الحجاج، التسكين، المجموعات، والتقارير
            </p>
            <span className="inline-flex items-center text-primary-700 font-medium">
              تسجيل دخول الإدارة ←
            </span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
          © 2026 الفجر للحج والعمرة - جميع الحقوق محفوظة
        </div>
      </footer>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-center">
      <div className="text-3xl font-bold text-emerald-700 arabic-num">
        {value}
      </div>
      <div className="text-sm text-slate-600 mt-1">{label}</div>
    </div>
  );
}
