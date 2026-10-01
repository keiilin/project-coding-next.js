import AdminSidebar from "../../components/layout/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      <AdminSidebar />

      <main className="flex-1 min-w-0 w-full pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}