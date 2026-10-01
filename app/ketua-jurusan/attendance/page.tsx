"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function KetuaJurusanAttendancePage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [attendances, setAttendances] = useState<any[]>([]);
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

  const getAttendances = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/ketua-jurusan/attendance"
      );

      const data = await response.json();

      if (response.ok) {
        setAttendances(data.data);
      }

    } catch (error) {
      console.error(error);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getAttendances();
    }
  }, [user]);

  if (!user || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Memuat data absensi...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-10">

      <div className="max-w-7xl mx-auto">

        <div className="flex justify-between items-center mb-8">

          <div>
            <h1 className="text-4xl font-bold">
              Monitoring Absensi
            </h1>

            <p className="text-gray-600 mt-2">
              Monitoring kehadiran seluruh siswa PKL.
            </p>
          </div>

          <button
            onClick={getAttendances}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg"
          >
            Refresh Data
          </button>

        </div>

        <div className="bg-white rounded-xl shadow p-6">

          {attendances.length === 0 ? (

            <div className="text-center py-10">

              <p className="text-gray-500">
                Belum ada data absensi.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full border-collapse">

                <thead>

                  <tr className="bg-slate-100">

                    <th className="border p-3 text-left">
                      No
                    </th>

                    <th className="border p-3 text-left">
                      Nama Siswa
                    </th>

                    <th className="border p-3 text-left">
                      Tempat PKL
                    </th>

                    <th className="border p-3 text-left">
                      Tanggal
                    </th>

                    <th className="border p-3 text-left">
                      Jam Masuk
                    </th>

                    <th className="border p-3 text-left">
                      Jam Pulang
                    </th>

                    <th className="border p-3 text-left">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {attendances.map((item, index) => (

                    <tr key={item.id}>

                      <td className="border p-3">
                        {index + 1}
                      </td>

                      <td className="border p-3">

                        <p className="font-semibold">
                          {item.user.nama}
                        </p>

                        <p className="text-sm text-gray-500">
                          {item.user.kelas || "-"}
                        </p>

                      </td>

                      <td className="border p-3">
                        {item.user.tempatPkl || "-"}
                      </td>

                      <td className="border p-3">

                        {new Date(
                          item.tanggal
                        ).toLocaleDateString("id-ID")}

                      </td>

                      <td className="border p-3">

                        {item.jamMasuk
                          ? new Date(
                              item.jamMasuk
                            ).toLocaleTimeString("id-ID")
                          : "-"}

                      </td>

                      <td className="border p-3">

                        {item.jamPulang
                          ? new Date(
                              item.jamPulang
                            ).toLocaleTimeString("id-ID")
                          : "-"}

                      </td>

                      <td className="border p-3">

                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">

                          {item.status}

                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </main>
  );
}