"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const desktopMenus = [
    {
      name: "Dashboard",
      href: "/siswa",
      icon: "🏠",
    },
    {
      name: "Absensi",
      href: "/absensi",
      icon: "📍",
    },
    {
      name: "Jadwal PKL",
      href: "/schedule",
      icon: "🕒",
    },
    {
      name: "Riwayat Absensi",
      href: "/history",
      icon: "📋",
    },
    {
      name: "Jurnal PKL",
      href: "/jurnal",
      icon: "📖",
    },
    {
      name: "Pengumuman",
      href: "/pengumuman",
      icon: "📢",
    },
    {
      name: "Profil",
      href: "/profil",
      icon: "👤",
    },
  ];

  const mobileMenus = [
    {
      name: "Beranda",
      href: "/siswa",
      icon: "🏠",
    },
    {
      name: "Absensi",
      href: "/absensi",
      icon: "📍",
    },
    {
      name: "Jadwal",
      href: "/schedule",
      icon: "🕒",
    },
    {
      name: "Jurnal",
      href: "/jurnal",
      icon: "📖",
    },
    {
      name: "Menu",
      href: "/menu",
      icon: "☰",
    },
  ];

  const handleLogout = () => {
    const confirmLogout = confirm(
      "Apakah kamu yakin ingin keluar dari akun?"
    );

    if (!confirmLogout) return;

    localStorage.removeItem("user");

    router.push("/login");
  };

  return (
    <>
      {/* DESKTOP SIDEBAR */}

      <aside className="hidden md:flex fixed left-0 top-0 w-64 h-screen bg-blue-700 text-white flex-col p-5 z-50">

        <div className="flex items-center gap-3 mb-8 px-2">

          <div className="w-11 h-11 bg-white text-blue-700 rounded-xl flex items-center justify-center font-bold text-xl">
            P
          </div>

          <div>

            <h1 className="font-bold text-lg">
              PKL Attendance
            </h1>

            <p className="text-xs text-blue-200">
              Sistem Presensi PKL
            </p>

          </div>

        </div>


        <nav className="flex-1 space-y-1">

          {desktopMenus.map((menu) => {

            const active =
              pathname === menu.href;

            return (

              <Link
                key={menu.href}
                href={menu.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  active
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-blue-100 hover:bg-blue-600"
                }`}
              >

                <span className="text-lg">
                  {menu.icon}
                </span>

                <span className="text-sm font-medium">
                  {menu.name}
                </span>

              </Link>

            );
          })}

        </nav>


        <div className="pt-4 border-t border-blue-600">

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-blue-100 hover:bg-red-500 hover:text-white transition"
          >

            <span className="text-lg">
              🚪
            </span>

            <span className="font-medium">
              Logout
            </span>

          </button>

        </div>

      </aside>


      {/* MOBILE HEADER */}

      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-50 flex items-center px-4">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold">
            P
          </div>

          <div>

            <h1 className="font-semibold text-sm">
              PKL Attendance
            </h1>

            <p className="text-xs text-gray-400">
              Sistem Presensi PKL
            </p>

          </div>

        </div>

      </header>


      {/* MOBILE BOTTOM NAV */}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">

        <div className="grid grid-cols-5 h-16">

          {mobileMenus.map((menu) => {

            const active =
              pathname === menu.href;

            return (

              <Link
                key={menu.href}
                href={menu.href}
                className={`flex flex-col items-center justify-center gap-1 transition ${
                  active
                    ? "text-blue-600"
                    : "text-gray-400"
                }`}
              >

                <span className="text-lg">
                  {menu.icon}
                </span>

                <span className={`text-[10px] ${
                  active
                    ? "font-semibold"
                    : ""
                }`}>
                  {menu.name}
                </span>

              </Link>

            );
          })}

        </div>

      </nav>

    </>
  );
}