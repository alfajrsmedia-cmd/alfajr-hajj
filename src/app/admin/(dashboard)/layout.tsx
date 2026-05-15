import AdminSidebar from "@/components/AdminSidebar";
import PrintButton from "@/components/PrintButton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <main className="flex-1 md:mr-64 transition-all">
        <div className="sticky top-0 z-30 flex justify-end items-center px-6 py-2 bg-slate-50/80 backdrop-blur border-b border-slate-100 print:hidden">
          <PrintButton />
        </div>
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
