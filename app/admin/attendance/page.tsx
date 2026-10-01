"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Attendance = {
  id: number;
  tanggal: string;
  jamMasuk: string | null;
  jamPulang: string | null;
  status: string;
  alasanTerlambat: string | null;
  alasanPulangTelat: string | null;
  fotoMasuk: string | null;
  fotoPulang: string | null;
  user: {
    id: number;
    nama: string;
    nis: string | null;
    kelas: string | null;
    jurusan: string | null;
    tempatPkl: string | null;
  };
};

export default function AdminAttendancePage() {
  const router = useRouter();

  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("SEMUA");

  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      if (user.role !== "ADMIN") {
        router.push("/login");
        return;
      }

      getAttendances();
    } catch (error) {
      console.error(error);
      router.push("/login");
    }
  }, [router]);

  const getAttendances = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/attendance");

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Gagal mengambil data absensi");
        return;
      }

      setAttendances(data.data || []);
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat mengambil data absensi");
    } finally {
      setLoading(false);
    }
  };

  const formatTanggal = (tanggal: string) => {
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatJam = (jam: string | null) => {
    if (!jam) return "-";

    return new Date(jam).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case "HADIR":
        return "bg-emerald-100 text-emerald-700";

      case "TERLAMBAT":
        return "bg-amber-100 text-amber-700";

      case "IZIN":
        return "bg-blue-100 text-blue-700";

      case "SAKIT":
        return "bg-purple-100 text-purple-700";

      case "ALPHA":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const filteredAttendances = useMemo(() => {
    return attendances.filter((attendance) => {
      const keyword = search.toLowerCase();

      const cocokSearch =
        attendance.user.nama.toLowerCase().includes(keyword) ||
        (attendance.user.nis || "").toLowerCase().includes(keyword) ||
        (attendance.user.kelas || "").toLowerCase().includes(keyword) ||
        (attendance.user.tempatPkl || "").toLowerCase().includes(keyword);

      const cocokStatus =
        filterStatus === "SEMUA" ||
        attendance.status.toUpperCase() === filterStatus;

      return cocokSearch && cocokStatus;
    });
  }, [attendances, search, filterStatus]);

  const totalHadir = attendances.filter(
    (item) => item.status.toUpperCase() === "HADIR"
  ).length;

  const totalTerlambat = attendances.filter(
    (item) =>
      item.status.toUpperCase() === "TERLAMBAT" ||
      item.alasanTerlambat
  ).length;

  const totalSudahPulang = attendances.filter(
    (item) => item.jamPulang
  ).length;

  const totalMasihPkl = attendances.filter(
    (item) => item.jamMasuk && !item.jamPulang
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/admin")}
            className="mb-4 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-100"
          >
            ← Kembali ke Dashboard
          </button>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">
                Manajemen Absensi
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Pantau seluruh data kehadiran siswa PKL.
              </p>
            </div>

            <button
              onClick={getAttendances}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              🔄 Refresh Data
            </button>
          </div>
        </div>

        {/* STATISTIK */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Absensi
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-800">
              {attendances.length}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Hadir
            </p>

            <h2 className="mt-2 text-3xl font-bold text-emerald-600">
              {totalHadir}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Terlambat
            </p>

            <h2 className="mt-2 text-3xl font-bold text-amber-600">
              {totalTerlambat}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Masih PKL
            </p>

            <h2 className="mt-2 text-3xl font-bold text-blue-600">
              {totalMasihPkl}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Sudah masuk, belum pulang
            </p>
          </div>

        </div>

        {/* FILTER */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Cari Siswa
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama, NIS, kelas, atau tempat PKL..."
                className="w-full rounded-xl border border-slate-200 p-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Filter Status
              </label>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 outline-none transition focus:border-blue-500"
              >
                <option value="SEMUA">Semua Status</option>
                <option value="HADIR">Hadir</option>
                <option value="TERLAMBAT">Terlambat</option>
                <option value="IZIN">Izin</option>
                <option value="SAKIT">Sakit</option>
                <option value="ALPHA">Alpha</option>
              </select>
            </div>

          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
            <span>
              Menampilkan{" "}
              <strong className="text-slate-700">
                {filteredAttendances.length}
              </strong>{" "}
              data
            </span>

            {search && (
              <button
                onClick={() => setSearch("")}
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Hapus pencarian
              </button>
            )}

            {filterStatus !== "SEMUA" && (
              <button
                onClick={() => setFilterStatus("SEMUA")}
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Reset filter
              </button>
            )}
          </div>

        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

          <div className="border-b p-5">
            <h2 className="font-bold text-slate-800">
              Data Kehadiran Siswa
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Detail presensi masuk dan pulang siswa PKL.
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-500">
              Memuat data absensi...
            </div>
          ) : filteredAttendances.length === 0 ? (
            <div className="p-10 text-center">

              <div className="mb-3 text-5xl">
                📋
              </div>

              <p className="font-semibold text-slate-700">
                Data absensi tidak ditemukan
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Coba ubah kata pencarian atau filter status.
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1500px] text-sm">

                <thead className="bg-slate-100">
                  <tr>

                    <th className="px-4 py-4 text-left">
                      No
                    </th>

                    <th className="px-4 py-4 text-left">
                      Siswa
                    </th>

                    <th className="px-4 py-4 text-left">
                      Kelas
                    </th>

                    <th className="px-4 py-4 text-left">
                      Tempat PKL
                    </th>

                    <th className="px-4 py-4 text-left">
                      Tanggal
                    </th>

                    <th className="px-4 py-4 text-left">
                      Jam Masuk
                    </th>

                    <th className="px-4 py-4 text-left">
                      Foto Masuk
                    </th>

                    <th className="px-4 py-4 text-left">
                      Jam Pulang
                    </th>

                    <th className="px-4 py-4 text-left">
                      Foto Pulang
                    </th>

                    <th className="px-4 py-4 text-left">
                      Status
                    </th>

                    <th className="px-4 py-4 text-left">
                      Keterangan
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredAttendances.map(
                    (attendance, index) => {

                      const alasan =
                        attendance.alasanTerlambat ||
                        attendance.alasanPulangTelat;

                      return (
                        <tr
                          key={attendance.id}
                          className="border-t transition hover:bg-slate-50"
                        >

                          {/* NO */}
                          <td className="px-4 py-4">
                            {index + 1}
                          </td>

                          {/* SISWA */}
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-semibold text-slate-800">
                                {attendance.user.nama}
                              </p>

                              <p className="text-xs text-slate-500">
                                NIS:{" "}
                                {attendance.user.nis || "-"}
                              </p>
                            </div>
                          </td>

                          {/* KELAS */}
                          <td className="px-4 py-4">
                            {attendance.user.kelas || "-"}
                          </td>

                          {/* TEMPAT PKL */}
                          <td className="px-4 py-4">
                            {attendance.user.tempatPkl || "-"}
                          </td>

                          {/* TANGGAL */}
                          <td className="px-4 py-4 whitespace-nowrap">
                            {formatTanggal(
                              attendance.tanggal
                            )}
                          </td>

                          {/* JAM MASUK */}
                          <td className="px-4 py-4">
                            {attendance.jamMasuk ? (
                              <span className="font-semibold text-emerald-600">
                                {formatJam(
                                  attendance.jamMasuk
                                )}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>

                          {/* FOTO MASUK */}
                          <td className="px-4 py-4">

                            {attendance.fotoMasuk ? (
                              <button
                                onClick={() =>
                                  setSelectedPhoto(
                                    attendance.fotoMasuk
                                  )
                                }
                                className="group relative"
                              >
                                <img
                                  src={attendance.fotoMasuk}
                                  alt="Foto masuk"
                                  className="h-16 w-16 rounded-xl object-cover shadow-sm transition group-hover:scale-105"
                                />

                                <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
                                  Lihat
                                </span>
                              </button>
                            ) : (
                              <span className="text-slate-400">
                                Tidak ada
                              </span>
                            )}

                          </td>

                          {/* JAM PULANG */}
                          <td className="px-4 py-4">
                            {attendance.jamPulang ? (
                              <span className="font-semibold text-blue-600">
                                {formatJam(
                                  attendance.jamPulang
                                )}
                              </span>
                            ) : (
                              <span className="text-slate-400">
                                Belum pulang
                              </span>
                            )}
                          </td>

                          {/* FOTO PULANG */}
                          <td className="px-4 py-4">

                            {attendance.fotoPulang ? (
                              <button
                                onClick={() =>
                                  setSelectedPhoto(
                                    attendance.fotoPulang
                                  )
                                }
                                className="group relative"
                              >
                                <img
                                  src={attendance.fotoPulang}
                                  alt="Foto pulang"
                                  className="h-16 w-16 rounded-xl object-cover shadow-sm transition group-hover:scale-105"
                                />

                                <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
                                  Lihat
                                </span>
                              </button>
                            ) : (
                              <span className="text-slate-400">
                                Tidak ada
                              </span>
                            )}

                          </td>

                          {/* STATUS */}
                          <td className="px-4 py-4">

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                                attendance.status
                              )}`}
                            >
                              {attendance.status}
                            </span>

                          </td>

                          {/* KETERANGAN */}
                          <td className="px-4 py-4">

                            {alasan ? (
                              <button
                                onClick={() =>
                                  setSelectedReason(alasan)
                                }
                                className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                              >
                                ⚠️ Lihat Alasan
                              </button>
                            ) : (
                              <span className="text-slate-400">
                                -
                              </span>
                            )}

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

        {/* INFO */}
        <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <h3 className="font-bold text-blue-800">
            ℹ️ Informasi
          </h3>

          <p className="mt-1 text-sm leading-relaxed text-blue-700">
            Data absensi di halaman ini diambil dari seluruh
            data presensi siswa yang tersimpan dalam sistem.
            Admin dapat melihat waktu masuk, waktu pulang,
            foto presensi, status, dan alasan keterlambatan.
          </p>
        </div>

      </div>

      {/* MODAL FOTO */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -right-2 -top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl font-bold text-slate-700 shadow-lg hover:bg-slate-100"
            >
              ×
            </button>

            <img
              src={selectedPhoto}
              alt="Foto presensi"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />

          </div>
        </div>
      )}

      {/* MODAL ALASAN */}
      {selectedReason && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedReason(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                Alasan Keterlambatan
              </h2>

              <button
                onClick={() => setSelectedReason(null)}
                className="text-2xl text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <div className="rounded-xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
              {selectedReason}
            </div>

            <button
              onClick={() => setSelectedReason(null)}
              className="mt-4 w-full rounded-xl bg-slate-800 py-3 font-semibold text-white hover:bg-slate-900"
            >
              Tutup
            </button>

          </div>
        </div>
      )}

    </main>
  );
}