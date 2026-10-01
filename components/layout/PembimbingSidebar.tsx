"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function PembimbingSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  const menuUtama = [
    {
      href: "/pembimbing/dashboard",
      label: "Dashboard",
      icon: "🏠",
    },
    {
      href: "/pembimbing/siswa",
      label: "Siswa",
      icon: "👥",
    },
    {
      href: "/pembimbing/attendance",
      label: "Absensi",
      icon: "📋",
    },
    {
      href: "/pembimbing/jurnal",
      label: "Jurnal",
      icon: "📖",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/pembimbing/dashboard") {
      return pathname === "/pembimbing/dashboard";
    }

    return pathname.startsWith(href);
  };

  return (
    <>
      {/* ================= DESKTOP ================= */}
      <aside className="hidden md:flex w-64 min-h-screen bg-blue-700 text-white p-6 flex-col shrink-0">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            PKL Attendance
          </h1>

          <p className="text-blue-200 text-sm mb-8">
            Pembimbing
          </p>

          <nav className="space-y-2">
            {menuUtama.map((menu) => (
              <Link
                key={menu.href}
                href={menu.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive(menu.href)
                    ? "bg-blue-500"
                    : "hover:bg-blue-600"
                }`}
              >
                <span>{menu.icon}</span>
                <span>{menu.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Logout Desktop */}
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 px-4 py-3 rounded-lg transition"
          >
            ↪ Logout
          </button>
        </div>
      </aside>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg">
        <div className="grid grid-cols-5 h-16">
          {menuUtama.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              className={`flex flex-col items-center justify-center text-xs ${
                isActive(menu.href)
                  ? "text-blue-600 font-semibold"
                  : "text-gray-500"
              }`}
            >
              <span className="text-xl leading-none">
                {menu.icon}
              </span>

              <span className="mt-1">
                {menu.label}
              </span>
            </Link>
          ))}

          {/* Menu Lainnya */}
          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center justify-center text-xs ${
              showMore
                ? "text-blue-600 font-semibold"
                : "text-gray-500"
            }`}
          >
            <span className="text-xl leading-none">
              ☰
            </span>

            <span className="mt-1">
              Lainnya
            </span>
          </button>
        </div>
      </div>

      {/* ================= MOBILE MENU LAINNYA ================= */}
      {showMore && (
        <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-white border-t shadow-xl">
          <div className="p-3">
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg"
            >
              ↪ Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
}