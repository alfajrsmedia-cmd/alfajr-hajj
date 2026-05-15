"use client";
import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-white border border-slate-200 rounded-lg shadow-sm transition print:hidden"
    >
      <Printer className="w-4 h-4" />
      طباعة
    </button>
  );
}
