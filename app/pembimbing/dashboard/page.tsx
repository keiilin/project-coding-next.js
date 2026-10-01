"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PembimbingDashboardPage() {
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

    if (userData.role !== "PEMBIMBING") {
      router.push("/login");
      return;
    }

    setUser(userData);
  }, [router]);

  const getDashboard = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/pembimbing/dashboard"
      );

      const result = await response.json();

      if (response.ok) {
        setData(result.data);
      } else {
        console.error(result.message);
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
            Dashboard Pembimbing
          </h1>

          <p className="text-gray-600 mt-2">
            Selamat datang, {user.nama}
          </p>

        </div>


        {/* STATISTIK */}

        <div className="grid md:grid-cols-3 gap-6 mb-8">

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
              Hadir Hari Ini
            </p>

            <h2 className="text-4xl font-bold text-green-600 mt-3">
              {data?.attendanceToday || 0}
            </h2>

          </div>


          <div className="bg-white rounded-xl shadow p-6">

            <p className="text-gray-500">
              Total Jurnal
            </p>

            <h2 className="text-4xl font-bold text-purple-600 mt-3">
              {data?.totalJournals || 0}
            </h2>

          </div>

        </div>


        {/* MENU */}

        <div className="grid md:grid-cols-3 gap-6 mb-8">

          <button
            onClick={() =>
              router.push("/pembimbing/siswa")
            }
            className="bg-white shadow rounded-xl p-6 text-left hover:shadow-lg"
          >

            <h2 className="text-xl font-bold">
              Data Siswa
            </h2>

            <p className="text-gray-500 mt-2">
              Melihat data seluruh siswa PKL.
            </p>

          </button>


          <button
            onClick={() =>
              router.push("/pembimbing/attendance")
            }
            className="bg-white shadow rounded-xl p-6 text-left hover:shadow-lg"
          >

            <h2 className="text-xl font-bold">
              Monitoring Absensi
            </h2>

            <p className="text-gray-500 mt-2">
              Melihat kehadiran siswa PKL.
            </p>

          </button>


          <button
            onClick={() =>
              router.push("/pembimbing/jurnal")
            }
            className="bg-white shadow rounded-xl p-6 text-left hover:shadow-lg"
          >

            <h2 className="text-xl font-bold">
              Jurnal Siswa
            </h2>

            <p className="text-gray-500 mt-2">
              Memantau kegiatan harian siswa.
            </p>

          </button>

        </div>


        {/* ABSENSI TERBARU */}

        <div className="bg-white rounded-xl shadow p-6">

          <div className="flex justify-between items-center mb-6">

            <h2 className="text-2xl font-bold">
              Absensi Terbaru
            </h2>

            <button
              onClick={() =>
                router.push("/pembimbing/attendance")
              }
              className="text-blue-600"
            >
              Lihat Semua
            </button>

          </div>


          {data?.recentAttendances?.length === 0 ? (

            <p className="text-gray-500">
              Belum ada data absensi.
            </p>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b text-left">

                    <th className="p-3">
                      Nama
                    </th>

                    <th className="p-3">
                      Kelas
                    </th>

                    <th className="p-3">
                      Jam Masuk
                    </th>

                    <th className="p-3">
                      Status
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {data?.recentAttendances?.map(
                    (item: any) => (

                      <tr
                        key={item.id}
                        className="border-b"
                      >

                        <td className="p-3">
                          {item.user.nama}
                        </td>

                        <td className="p-3">
                          {item.user.kelas || "-"}
                        </td>

                        <td className="p-3">

                          {item.jamMasuk
                            ? new Date(
                                item.jamMasuk
                              ).toLocaleTimeString(
                                "id-ID"
                              )
                            : "-"}

                        </td>

                        <td className="p-3">

                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">

                            {item.status}

                          </span>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </main>
  );
}