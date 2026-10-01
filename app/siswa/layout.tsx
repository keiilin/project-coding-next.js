import Sidebar from "@/components/layout/Sidebar";

export default function SiswaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">

      <Sidebar />

      <main className="md:ml-64 pt-16 md:pt-0 pb-20 md:pb-0">
        {children}
      </main>

    </div>
  );
}