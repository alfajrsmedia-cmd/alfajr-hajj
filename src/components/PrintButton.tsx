"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <div className="no-print fixed top-4 left-4 z-50">
      <button
        onClick={() => window.print()}
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
      >
        <Printer className="w-4 h-4" />
        طباعة
      </button>
    </div>
  );
}
