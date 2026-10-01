import KetuaJurusanSidebar from "../../components/layout/KetuaJurusanSidebar";

export default function KetuaJurusanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      <KetuaJurusanSidebar />

      <main className="flex-1 min-w-0 w-full pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}