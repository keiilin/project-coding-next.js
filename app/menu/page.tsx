"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MenuPage() {
  const router = useRouter();

  const menus = [
    {
      name: "Riwayat Absensi",
      description: "Lihat riwayat kehadiran PKL",
      href: "/history",
      icon: "📋",
    },
    {
      name: "Pengumuman",
      description: "Informasi terbaru dari sekolah",
      href: "/pengumuman",
      icon: "📢",
    },
    {
      name: "Profil Saya",
      description: "Lihat dan ubah data akun",
      href: "/profil",
      icon: "👤",
    },
  ];

  const handleLogout = () => {
    const confirmLogout = confirm(
      "Apakah kamu yakin ingin keluar?"
    );

    if (!confirmLogout) return;

    localStorage.removeItem("user");

    router.push("/login");
  };

  return (
    <main className="p-4 sm:p-6 md:p-8">

      <div className="max-w-3xl mx-auto">

        <div className="mb-6">

          <p className="text-sm text-gray-500">
            Navigasi
          </p>

          <h1 className="text-2xl sm:text-3xl font-bold mt-1">
            Menu Lainnya
          </h1>

        </div>


        <div className="space-y-3">

          {menus.map((menu) => (

            <Link
              key={menu.href}
              href={menu.href}
              className="flex items-center gap-4 bg-white border rounded-2xl p-4 hover:border-blue-300 hover:shadow-sm transition"
            >

              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-xl">
                {menu.icon}
              </div>


              <div className="flex-1">

                <h2 className="font-semibold">
                  {menu.name}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {menu.description}
                </p>

              </div>


              <div className="text-gray-400">
                →
              </div>

            </Link>

          ))}

        </div>


        <button
          onClick={handleLogout}
          className="w-full mt-6 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl p-4 font-medium transition"
        >
          🚪 Logout
        </button>

      </div>

    </main>
  );
}