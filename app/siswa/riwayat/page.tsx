"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  nama: string;
  username: string;
  role: string;
  kelas?: string | null;
  jurusan?: string | null;
  tempatPkl?: string | null;
};

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
};

export default function RiwayatPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPhoto, setSelectedPhoto] =
    useState<string | null>(null);

  const [selectedReason, setSelectedReason] =
    useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const userData: User = JSON.parse(storedUser);

      if (userData.role !== "SISWA") {
        router.push("/login");
        return;
      }

      setUser(userData);
      getHistory(userData.id);
    } catch (error) {
      console.error(error);
      router.push("/login");
    }
  }, [router]);

  const getHistory = async (userId: number) => {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/attendance/history?userId=${userId}`
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Gagal mengambil riwayat presensi."
        );
        return;
      }

      setAttendance(data.data || []);
    } catch (error) {
      console.error(
        "LOAD HISTORY ERROR:",
        error
      );

      alert(
        "Terjadi kesalahan saat mengambil riwayat presensi."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatTanggal = (tanggal: string) => {
    return new Date(tanggal).toLocaleDateString(
      "id-ID",
      {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  const formatJam = (jam: string | null) => {
    if (!jam) return "-";

    return new Date(jam).toLocaleTimeString(
      "id-ID",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getStatusStyle = (status: string) => {
    const normalizedStatus =
      status.toUpperCase();

    if (normalizedStatus === "HADIR") {
      return "bg-emerald-100 text-emerald-700";
    }

    if (
      normalizedStatus === "TERLAMBAT"
    ) {
      return "bg-amber-100 text-amber-700";
    }

    if (
      normalizedStatus === "IZIN"
    ) {
      return "bg-blue-100 text-blue-700";
    }

    if (
      normalizedStatus === "SAKIT"
    ) {
      return "bg-purple-100 text-purple-700";
    }

    return "bg-slate-100 text-slate-700";
  };

  const totalHadir = attendance.filter(
    (item) =>
      item.status.toUpperCase() === "HADIR"
  ).length;

  const totalTerlambat = attendance.filter(
    (item) =>
      item.status.toUpperCase() ===
      "TERLAMBAT"
  ).length;

  const totalSudahPulang = attendance.filter(
    (item) => item.jamPulang
  ).length;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />

          <p className="font-semibold text-slate-700">
            Memuat riwayat presensi...
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Mohon tunggu sebentar
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">

          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Riwayat Presensi
            </h1>

            <p className="text-xs text-slate-500">
              Sistem Presensi PKL
            </p>
          </div>

          <button
            onClick={() =>
              router.push("/siswa")
            }
            className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            ← Dashboard
          </button>

        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">

        {/* IDENTITAS */}
        <section className="mb-6 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-sm md:p-8">

          <p className="text-sm text-blue-100">
            Riwayat Presensi Siswa
          </p>

          <h2 className="mt-1 text-2xl font-bold md:text-3xl">
            {user?.nama}
          </h2>

          <div className="mt-4 flex flex-wrap gap-2">

            {user?.kelas && (
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                🎓 {user.kelas}
              </span>
            )}

            {user?.jurusan && (
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                💻 {user.jurusan}
              </span>
            )}

            {user?.tempatPkl && (
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                🏢 {user.tempatPkl}
              </span>
            )}

          </div>

        </section>

        {/* STATISTIK */}
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Presensi
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {attendance.length}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Hari tercatat
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Hadir
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {totalHadir}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Presensi tepat waktu
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Terlambat
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-600">
              {totalTerlambat}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Presensi terlambat
            </p>
          </div>

        </section>

        {/* INFORMASI */}
        <section className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">

          <div className="flex gap-3">

            <div className="text-xl">
              ℹ️
            </div>

            <div>
              <p className="font-semibold text-blue-800">
                Informasi Presensi
              </p>

              <p className="mt-1 text-sm leading-relaxed text-blue-700">
                Pastikan setiap presensi memiliki
                foto sebagai bukti kehadiran.
                Jika kamu terlambat atau pulang
                melewati jadwal, alasan akan
                ditampilkan pada riwayat.
              </p>
            </div>

          </div>

        </section>

        {/* RIWAYAT */}
        <section className="rounded-2xl bg-white shadow-sm">

          <div className="border-b p-5 md:p-6">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Daftar Riwayat
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Seluruh data presensi kamu
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-600">
                {totalSudahPulang} sudah absen pulang
              </div>

            </div>

          </div>

          {attendance.length === 0 ? (

            <div className="p-8 text-center md:p-12">

              <div className="mb-4 text-5xl">
                📋
              </div>

              <h3 className="text-lg font-bold text-slate-700">
                Belum Ada Riwayat
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Kamu belum memiliki data
                presensi. Silakan lakukan
                presensi masuk terlebih dahulu.
              </p>

              <button
                onClick={() =>
                  router.push("/absensi")
                }
                className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                📸 Absen Sekarang
              </button>

            </div>

          ) : (

            <div className="divide-y divide-slate-100">

              {attendance.map((item) => (

                <div
                  key={item.id}
                  className="p-5 transition hover:bg-slate-50 md:p-6"
                >

                  {/* BAGIAN ATAS */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                    <div>
                      <p className="font-bold text-slate-800">
                        {formatTanggal(
                          item.tanggal
                        )}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        ID Presensi #{item.id}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>

                  </div>

                  {/* JAM */}
                  <div className="mt-5 grid grid-cols-2 gap-3">

                    <div className="rounded-xl bg-emerald-50 p-4">

                      <p className="text-xs text-slate-500">
                        🟢 Jam Masuk
                      </p>

                      <p className="mt-2 text-lg font-bold text-emerald-700">
                        {formatJam(
                          item.jamMasuk
                        )}
                      </p>

                    </div>

                    <div className="rounded-xl bg-blue-50 p-4">

                      <p className="text-xs text-slate-500">
                        🔵 Jam Pulang
                      </p>

                      <p className="mt-2 text-lg font-bold text-blue-700">
                        {formatJam(
                          item.jamPulang
                        )}
                      </p>

                    </div>

                  </div>

                  {/* FOTO */}
                  {(item.fotoMasuk ||
                    item.fotoPulang) && (

                    <div className="mt-4">

                      <p className="mb-2 text-xs font-semibold text-slate-500">
                        📸 Bukti Foto
                      </p>

                      <div className="grid grid-cols-2 gap-3">

                        {item.fotoMasuk && (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedPhoto(
                                item.fotoMasuk
                              )
                            }
                            className="group relative overflow-hidden rounded-xl border bg-slate-100"
                          >
                            <img
                              src={item.fotoMasuk}
                              alt="Foto absensi masuk"
                              className="h-40 w-full object-cover transition group-hover:scale-105"
                            />

                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-3 py-2 text-left text-xs font-semibold text-white">
                              Foto Masuk
                            </div>
                          </button>
                        )}

                        {item.fotoPulang && (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedPhoto(
                                item.fotoPulang
                              )
                            }
                            className="group relative overflow-hidden rounded-xl border bg-slate-100"
                          >
                            <img
                              src={item.fotoPulang}
                              alt="Foto absensi pulang"
                              className="h-40 w-full object-cover transition group-hover:scale-105"
                            />

                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-3 py-2 text-left text-xs font-semibold text-white">
                              Foto Pulang
                            </div>
                          </button>
                        )}

                      </div>

                    </div>
                  )}

                  {/* ALASAN */}
                  {(item.alasanTerlambat ||
                    item.alasanPulangTelat) && (

                    <div className="mt-4 space-y-3">

                      {item.alasanTerlambat && (
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedReason(
                              item.alasanTerlambat
                            )
                          }
                          className="w-full rounded-xl bg-amber-50 p-4 text-left transition hover:bg-amber-100"
                        >
                          <p className="text-xs font-bold text-amber-700">
                            ⚠️ Alasan Terlambat
                          </p>

                          <p className="mt-1 line-clamp-2 text-sm text-amber-800">
                            {item.alasanTerlambat}
                          </p>

                          <p className="mt-2 text-xs font-semibold text-amber-600">
                            Klik untuk melihat selengkapnya
                          </p>
                        </button>
                      )}

                      {item.alasanPulangTelat && (
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedReason(
                              item.alasanPulangTelat
                            )
                          }
                          className="w-full rounded-xl bg-orange-50 p-4 text-left transition hover:bg-orange-100"
                        >
                          <p className="text-xs font-bold text-orange-700">
                            ⚠️ Alasan Pulang Telat
                          </p>

                          <p className="mt-1 line-clamp-2 text-sm text-orange-800">
                            {item.alasanPulangTelat}
                          </p>

                          <p className="mt-2 text-xs font-semibold text-orange-600">
                            Klik untuk melihat selengkapnya
                          </p>
                        </button>
                      )}

                    </div>
                  )}

                </div>

              ))}

            </div>

          )}

        </section>

        {/* BOTTOM BUTTON */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">

          <button
            onClick={() =>
              router.push("/siswa")
            }
            className="flex-1 rounded-xl border border-slate-200 bg-white py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            ← Kembali ke Dashboard
          </button>

          <button
            onClick={() =>
              router.push("/absensi")
            }
            className="flex-1 rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            📸 Buka Presensi
          </button>

        </div>

      </div>

      {/* MODAL FOTO */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() =>
            setSelectedPhoto(null)
          }
        >

          <div
            className="relative max-h-[90vh] w-full max-w-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              type="button"
              onClick={() =>
                setSelectedPhoto(null)
              }
              className="absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-xl text-white hover:bg-black/80"
            >
              ✕
            </button>

            <img
              src={selectedPhoto}
              alt="Bukti presensi"
              className="max-h-[85vh] w-full rounded-2xl bg-white object-contain"
            />

          </div>

        </div>
      )}

      {/* MODAL ALASAN */}
      {selectedReason && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() =>
            setSelectedReason(null)
          }
        >

          <div
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl md:p-6"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="flex items-center justify-between">

              <h2 className="text-lg font-bold text-slate-800">
                Alasan Presensi
              </h2>

              <button
                type="button"
                onClick={() =>
                  setSelectedReason(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                ✕
              </button>

            </div>

            <div className="mt-4 rounded-xl bg-slate-50 p-4">

              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {selectedReason}
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setSelectedReason(null)
              }
              className="mt-4 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Tutup
            </button>

          </div>

        </div>
      )}

    </main>
  );
}