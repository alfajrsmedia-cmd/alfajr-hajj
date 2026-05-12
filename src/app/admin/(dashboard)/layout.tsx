import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <main className="flex-1 md:mr-64 transition-all">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
