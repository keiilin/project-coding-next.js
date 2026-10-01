"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const router = useRouter();

  const [attendances, setAttendances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const getAttendances = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch(
        "/api/admin/attendance/history"
      );

      const contentType = response.headers.get("content-type");

      if (!contentType?.includes("application/json")) {
        throw new Error("API tidak mengembalikan data JSON");
      }

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(
          data.message || "Gagal mengambil data absensi"
        );
        return;
      }

      setAttendances(data.data || []);

    } catch (error) {
      console.error(error);

      setErrorMessage(
        "Terjadi kesalahan saat mengambil data absensi"
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAttendances();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-10">

      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">

          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Riwayat Absensi
            </h1>

            <p className="text-gray-600 mt-2">
              Riwayat kehadiran seluruh siswa PKL
            </p>
          </div>

          <div className="flex gap-3">

            <button
              onClick={() => router.push("/admin")}
              className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-lg"
            >
              Dashboard
            </button>

            <button
              onClick={getAttendances}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
            >
              Refresh
            </button>

          </div>

        </div>

        {errorMessage && (

          <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg mb-6">

            {errorMessage}

          </div>

        )}

        <div className="bg-white rounded-xl shadow p-6 md:p-8">

          {loading ? (

            <div className="text-center py-10">
              Memuat data...
            </div>

          ) : attendances.length === 0 ? (

            <div className="text-center py-10">

              <p className="text-gray-500">
                Belum ada riwayat absensi.
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
                      Kelas
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

                    <tr
                      key={item.id}
                      className="hover:bg-slate-50"
                    >

                      <td className="border p-3">
                        {index + 1}
                      </td>

                      <td className="border p-3 font-medium">
                        {item.user?.nama || "-"}
                      </td>

                      <td className="border p-3">
                        {item.user?.kelas || "-"}
                      </td>

                      <td className="border p-3">
                        {item.user?.tempatPkl || "-"}
                      </td>

                      <td className="border p-3">

                        {item.tanggal
                          ? new Date(
                              item.tanggal
                            ).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })
                          : "-"}

                      </td>

                      <td className="border p-3">

                        {item.jamMasuk
                          ? new Date(
                              item.jamMasuk
                            ).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}

                      </td>

                      <td className="border p-3">

                        {item.jamPulang
                          ? new Date(
                              item.jamPulang
                            ).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}

                      </td>

                      <td className="border p-3">

                        {item.jamPulang ? (

                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                            Selesai
                          </span>

                        ) : (

                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                            Sedang PKL
                          </span>

                        )}

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