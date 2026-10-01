"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);

  const [attendances, setAttendances] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");


  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(storedUser);

    if (userData.role !== "SISWA") {
      router.push("/login");
      return;
    }

    setUser(userData);

  }, [router]);


  const getHistory = async () => {
    if (!user) return;

    try {
      setLoading(true);

      let url = `/api/history?userId=${user.id}`;

      if (startDate) {
        url += `&startDate=${startDate}`;
      }

      if (endDate) {
        url += `&endDate=${endDate}`;
      }

      const response = await fetch(url);

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
      getHistory();
    }
  }, [user]);


  const handleFilter = () => {
    getHistory();
  };


  const resetFilter = () => {
    setStartDate("");
    setEndDate("");

    setTimeout(() => {
      getHistory();
    }, 100);
  };


  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      "id-ID",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };


  const formatTime = (date: string | null) => {
    if (!date) return "-";

    return new Date(date).toLocaleTimeString(
      "id-ID",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };


  if (loading && !user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Memuat...
      </main>
    );
  }


  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10">

      <div className="max-w-6xl mx-auto">


        {/* HEADER */}

        <div className="mb-8">

          <p className="text-sm text-gray-500">
            Data Kehadiran
          </p>

          <h1 className="text-3xl sm:text-4xl font-bold mt-1">
            Riwayat Absensi
          </h1>

          <p className="text-gray-500 mt-2">
            Lihat seluruh riwayat kehadiran PKL kamu.
          </p>

        </div>


        {/* STATISTIK */}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">

          <div className="bg-white border rounded-2xl p-5">

            <p className="text-sm text-gray-500">
              Total Absensi
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {attendances.length}
            </h2>

          </div>


          <div className="bg-white border rounded-2xl p-5">

            <p className="text-sm text-gray-500">
              Sudah Pulang
            </p>

            <h2 className="text-3xl font-bold mt-2 text-green-600">

              {
                attendances.filter(
                  (item) => item.jamPulang
                ).length
              }

            </h2>

          </div>


          <div className="bg-white border rounded-2xl p-5 col-span-2 sm:col-span-1">

            <p className="text-sm text-gray-500">
              Belum Pulang
            </p>

            <h2 className="text-3xl font-bold mt-2 text-orange-500">

              {
                attendances.filter(
                  (item) => !item.jamPulang
                ).length
              }

            </h2>

          </div>

        </div>


        {/* FILTER */}

        <div className="bg-white border rounded-2xl p-5 mb-6">

          <h2 className="font-semibold text-lg mb-4">
            Filter Riwayat
          </h2>


          <div className="grid sm:grid-cols-3 gap-4">


            <div>

              <label className="text-sm text-gray-600 block mb-2">
                Dari Tanggal
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) =>
                  setStartDate(e.target.value)
                }
                className="w-full border rounded-xl px-4 py-3"
              />

            </div>


            <div>

              <label className="text-sm text-gray-600 block mb-2">
                Sampai Tanggal
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(e) =>
                  setEndDate(e.target.value)
                }
                className="w-full border rounded-xl px-4 py-3"
              />

            </div>


            <div className="flex items-end gap-2">

              <button
                onClick={handleFilter}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium"
              >
                Terapkan
              </button>


              <button
                onClick={resetFilter}
                className="px-5 py-3 border hover:bg-gray-50 rounded-xl"
              >
                Reset
              </button>

            </div>

          </div>

        </div>


        {/* RIWAYAT */}

        {loading ? (

          <div className="bg-white rounded-2xl border p-10 text-center">
            Memuat data absensi...
          </div>

        ) : attendances.length === 0 ? (

          <div className="bg-white rounded-2xl border p-10 text-center">

            <div className="text-5xl mb-4">
              📅
            </div>

            <h2 className="text-xl font-bold">
              Belum Ada Riwayat
            </h2>

            <p className="text-gray-500 mt-2">
              Kamu belum memiliki data absensi.
            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {attendances.map((item) => (

              <div
                key={item.id}
                className="bg-white border rounded-2xl p-5 sm:p-6"
              >


                {/* BAGIAN ATAS */}

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">


                  <div>

                    <h2 className="font-bold text-lg">

                      {formatDate(item.tanggal)}

                    </h2>


                    <p className="text-sm text-gray-500 mt-1">

                      Status Kehadiran

                    </p>

                  </div>


                  <span className="w-fit bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">

                    {item.status}

                  </span>

                </div>


                {/* JAM ABSENSI */}

                <div className="grid grid-cols-2 gap-4 mt-6">


                  <div className="bg-blue-50 rounded-xl p-4">

                    <p className="text-sm text-blue-600">
                      Jam Masuk
                    </p>

                    <p className="font-bold text-xl mt-1">

                      {formatTime(item.jamMasuk)}

                    </p>

                  </div>


                  <div className="bg-red-50 rounded-xl p-4">

                    <p className="text-sm text-red-600">
                      Jam Pulang
                    </p>

                    <p className="font-bold text-xl mt-1">

                      {formatTime(item.jamPulang)}

                    </p>

                  </div>

                </div>


                {/* ALASAN */}

                {(item.alasanTerlambat ||
                  item.alasanPulangTelat) && (

                  <div className="mt-5 space-y-3">


                    {item.alasanTerlambat && (

                      <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">

                        <p className="font-medium text-yellow-700">
                          Alasan Terlambat
                        </p>

                        <p className="text-sm text-gray-600 mt-1">

                          {item.alasanTerlambat}

                        </p>

                      </div>

                    )}


                    {item.alasanPulangTelat && (

                      <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">

                        <p className="font-medium text-orange-700">
                          Alasan Pulang Telat
                        </p>

                        <p className="text-sm text-gray-600 mt-1">

                          {item.alasanPulangTelat}

                        </p>

                      </div>

                    )}

                  </div>

                )}


                {/* FOTO */}

                {(item.fotoMasuk ||
                  item.fotoPulang) && (

                  <div className="grid grid-cols-2 gap-4 mt-5">


                    {item.fotoMasuk && (

                      <div>

                        <p className="text-sm font-medium mb-2">
                          Foto Masuk
                        </p>

                        <img
                          src={item.fotoMasuk}
                          alt="Foto masuk"
                          className="w-full h-40 sm:h-52 object-cover rounded-xl border"
                        />

                      </div>

                    )}


                    {item.fotoPulang && (

                      <div>

                        <p className="text-sm font-medium mb-2">
                          Foto Pulang
                        </p>

                        <img
                          src={item.fotoPulang}
                          alt="Foto pulang"
                          className="w-full h-40 sm:h-52 object-cover rounded-xl border"
                        />

                      </div>

                    )}

                  </div>

                )}

              </div>

            ))}

          </div>

        )}

      </div>

    </main>
  );
}