"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function KetuaJurusanDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(storedUser);

    if (userData.role !== "KETUA_JURUSAN") {
      router.push("/login");
      return;
    }

    setUser(userData);
  }, [router]);

  const getDashboard = async () => {
    try {
      const response = await fetch(
        "/api/ketua-jurusan/dashboard"
      );

      const result = await response.json();

      if (response.ok) {
        setData(result.data);
      }

    } catch (error) {
      console.error(error);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getDashboard();
    }
  }, [user]);

  if (!user || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Memuat dashboard...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-10">

      <div className="max-w-7xl mx-auto">

        <div className="mb-8">

          <h1 className="text-4xl font-bold">
            Dashboard Ketua Jurusan
          </h1>

          <p className="text-gray-600 mt-2">
            Selamat datang, {user.nama}
          </p>

        </div>

        <div className="grid md:grid-cols-4 gap-6">

          <div className="bg-white rounded-xl shadow p-6">

            <p className="text-gray-500">
              Total Siswa PKL
            </p>

            <h2 className="text-4xl font-bold text-blue-600 mt-3">
              {data?.totalStudents || 0}
            </h2>

          </div>


          <div className="bg-white rounded-xl shadow p-6">

            <p className="text-gray-500">
              Total Pembimbing
            </p>

            <h2 className="text-4xl font-bold text-purple-600 mt-3">
              {data?.totalPembimbing || 0}
            </h2>

          </div>


          <div className="bg-white rounded-xl shadow p-6">

            <p className="text-gray-500">
              Hadir Hari Ini
            </p>

            <h2 className="text-4xl font-bold text-green-600 mt-3">
              {data?.attendanceToday || 0}
            </h2>

          </div>


          <div className="bg-white rounded-xl shadow p-6">

            <p className="text-gray-500">
              Tempat PKL
            </p>

            <h2 className="text-4xl font-bold text-orange-600 mt-3">
              {data?.totalTempatPkl || 0}
            </h2>

          </div>

        </div>

      </div>

    </main>
  );
}