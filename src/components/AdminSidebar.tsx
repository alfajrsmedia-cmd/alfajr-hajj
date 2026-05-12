"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  UserCog,
  Printer,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import clsx from "clsx";

const links = [
  { href: "/admin/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/admin/pilgrims", label: "الحجاج", icon: Users },
  { href: "/admin/rooms", label: "الغرف والتسكين", icon: Building2 },
  { href: "/admin/groups", label: "المجموعات", icon: UserCog },
  { href: "/admin/print", label: "كشوف الطباعة", icon: Printer },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-md"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed top-0 right-0 h-screen w-64 bg-white border-l border-slate-200 z-40 transition-transform",
          "md:translate-x-0",
          open ? "translate-x-0" : "translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">ف</span>
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">الفجر</p>
                <p className="text-xs text-slate-500">لوحة الإدارة</p>
              </div>
            </div>
          </div>

          {/* Links */}
          <nav className="flex-1 p-4 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition",
                    isActive
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition"
            >
              <LogOut className="w-5 h-5" />
              تسجيل خروج
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
