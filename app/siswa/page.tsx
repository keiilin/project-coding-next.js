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

type Journal = {
  id: number;
  tanggal: string;
  kegiatan: string;
  kendala: string | null;
};

type Announcement = {
  id: number;
  judul: string;
  isi: string;
  createdAt: string;
};

type Schedule = {
  hari: string;
  jamMasuk: string;
  jamPulang: string;
};

export default function SiswaPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [attendance, setAttendance] =
    useState<Attendance | null>(null);
  const [totalAttendance, setTotalAttendance] = useState(0);
  const [totalJournal, setTotalJournal] = useState(0);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [announcements, setAnnouncements] =
    useState<Announcement[]>([]);
  const [schedule, setSchedule] =
    useState<Schedule | null>(null);

  const [loading, setLoading] = useState(true);

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
      getDashboard(userData.id);
    } catch (error) {
      console.error(error);
      router.push("/login");
    }
  }, [router]);

  const getDashboard = async (userId: number) => {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/dashboard?userId=${userId}`
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Gagal mengambil data dashboard"
        );
        return;
      }

      const dashboard = data.data;

      setAttendance(
        dashboard.attendanceToday || null
      );

      setTotalAttendance(
        dashboard.totalAttendance || 0
      );

      setTotalJournal(
        dashboard.totalJournal || 0
      );

      setJournals(
        dashboard.journals || []
      );

      setAnnouncements(
        dashboard.announcements || []
      );

      setSchedule(
        dashboard.schedule || null
      );
    } catch (error) {
      console.error(error);

      alert(
        "Terjadi kesalahan saat mengambil data dashboard"
      );
    } finally {
      setLoading(false);
    }
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

  const formatTanggal = (tanggal: string) => {
    return new Date(tanggal).toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  const getTodayName = () => {
    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];

    return days[new Date().getDay()];
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-3 text-4xl">
            ⏳
          </div>

          <p className="font-semibold text-slate-700">
            Memuat dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">

          <div>
            <h1 className="text-xl font-bold text-slate-800">
              PKL Attendance
            </h1>

            <p className="text-xs text-slate-500">
              Dashboard Siswa
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
          >
            Keluar
          </button>

        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">

        {/* WELCOME */}
        <section className="mb-6 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-sm md:p-8">

          <p className="text-sm text-blue-100">
            Selamat datang 👋
          </p>

          <h2 className="mt-1 text-2xl font-bold md:text-3xl">
            {user.nama}
          </h2>

          <div className="mt-4 flex flex-wrap gap-2">

            {user.kelas && (
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                🎓 {user.kelas}
              </span>
            )}

            {user.jurusan && (
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                💻 {user.jurusan}
              </span>
            )}

            {user.tempatPkl && (
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                🏢 {user.tempatPkl}
              </span>
            )}

          </div>

        </section>

        {/* QUICK ACTION */}
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <button
            onClick={() => router.push("/absensi")}
            className="rounded-2xl bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-2xl">
              📸
            </div>

            <h3 className="font-bold text-slate-800">
              Presensi
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Absen masuk dan pulang PKL
            </p>
          </button>

          <button
            onClick={() => router.push("/siswa/jurnal")}
            className="rounded-2xl bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-2xl">
              📖
            </div>

            <h3 className="font-bold text-slate-800">
              Jurnal PKL
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Catat kegiatan PKL harian
            </p>
          </button>

          <button
            onClick={() => router.push("/siswa/riwayat")}
            className="rounded-2xl bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
              📊
            </div>

            <h3 className="font-bold text-slate-800">
              Riwayat
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Lihat riwayat presensi
            </p>
          </button>

        </section>

        {/* STATISTIK */}
        <section className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Kehadiran
            </p>

            <h3 className="mt-2 text-3xl font-bold text-emerald-600">
              {totalAttendance}
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Hari tercatat
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Jurnal
            </p>

            <h3 className="mt-2 text-3xl font-bold text-purple-600">
              {totalJournal}
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Kegiatan tercatat
            </p>
          </div>

          <div className="col-span-2 rounded-2xl bg-white p-5 shadow-sm md:col-span-1">
            <p className="text-sm text-slate-500">
              Hari Ini
            </p>

            <h3 className="mt-2 text-xl font-bold text-blue-600">
              {getTodayName()}
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              {formatTanggal(
                new Date().toISOString()
              )}
            </p>
          </div>

        </section>

        {/* ABSENSI HARI INI + JADWAL */}
        <section className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* ABSENSI */}
          <div className="rounded-2xl bg-white p-5 shadow-sm md:p-6">

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-800">
                  Presensi Hari Ini
                </h2>

                <p className="text-sm text-slate-500">
                  Status kehadiran kamu hari ini
                </p>
              </div>

              <span className="text-2xl">
                📋
              </span>
            </div>

            {!attendance ? (
              <div className="rounded-xl bg-slate-50 p-6 text-center">

                <div className="mb-2 text-4xl">
                  🕐
                </div>

                <p className="font-semibold text-slate-700">
                  Belum melakukan presensi
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Silakan lakukan presensi masuk.
                </p>

                <button
                  onClick={() =>
                    router.push("/absensi")
                  }
                  className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Absen Sekarang
                </button>

              </div>
            ) : (
              <div className="space-y-4">

                <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4">
                  <div>
                    <p className="text-xs text-slate-500">
                      Status
                    </p>

                    <p className="mt-1 font-bold text-emerald-700">
                      {attendance.status}
                    </p>
                  </div>

                  <span className="text-2xl">
                    ✅
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      Jam Masuk
                    </p>

                    <p className="mt-1 text-lg font-bold text-emerald-600">
                      {formatJam(
                        attendance.jamMasuk
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      Jam Pulang
                    </p>

                    <p className="mt-1 text-lg font-bold text-blue-600">
                      {formatJam(
                        attendance.jamPulang
                      )}
                    </p>
                  </div>

                </div>

                {attendance.alasanTerlambat && (
                  <div className="rounded-xl bg-amber-50 p-4">
                    <p className="text-xs font-semibold text-amber-700">
                      Alasan Terlambat
                    </p>

                    <p className="mt-1 text-sm text-amber-800">
                      {attendance.alasanTerlambat}
                    </p>
                  </div>
                )}

                {attendance.alasanPulangTelat && (
                  <div className="rounded-xl bg-orange-50 p-4">
                    <p className="text-xs font-semibold text-orange-700">
                      Alasan Pulang Telat
                    </p>

                    <p className="mt-1 text-sm text-orange-800">
                      {attendance.alasanPulangTelat}
                    </p>
                  </div>
                )}

                <button
                  onClick={() =>
                    router.push("/absensi")
                  }
                  className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Buka Halaman Presensi
                </button>

              </div>
            )}

          </div>

          {/* JADWAL */}
          <div className="rounded-2xl bg-white p-5 shadow-sm md:p-6">

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-800">
                  Jadwal Hari Ini
                </h2>

                <p className="text-sm text-slate-500">
                  Jadwal PKL kamu
                </p>
              </div>

              <span className="text-2xl">
                🗓️
              </span>
            </div>

            {!schedule ? (
              <div className="rounded-xl bg-slate-50 p-6 text-center">

                <div className="mb-2 text-4xl">
                  🗓️
                </div>

                <p className="font-semibold text-slate-700">
                  Belum ada jadwal
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Jadwal untuk hari ini belum tersedia.
                </p>

              </div>
            ) : (
              <div className="rounded-2xl bg-blue-50 p-6">

                <p className="text-sm font-semibold text-blue-700">
                  {schedule.hari}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-4">

                  <div className="rounded-xl bg-white p-4">
                    <p className="text-xs text-slate-500">
                      Jam Masuk
                    </p>

                    <p className="mt-2 text-xl font-bold text-emerald-600">
                      {schedule.jamMasuk}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-4">
                    <p className="text-xs text-slate-500">
                      Jam Pulang
                    </p>

                    <p className="mt-2 text-xl font-bold text-blue-600">
                      {schedule.jamPulang}
                    </p>
                  </div>

                </div>

              </div>
            )}

          </div>

        </section>

        {/* JURNAL + PENGUMUMAN */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* JURNAL */}
          <div className="rounded-2xl bg-white p-5 shadow-sm md:p-6">

            <div className="mb-5 flex items-center justify-between">

              <div>
                <h2 className="font-bold text-slate-800">
                  Jurnal Terbaru
                </h2>

                <p className="text-sm text-slate-500">
                  Kegiatan PKL terbaru
                </p>
              </div>

              <button
                onClick={() =>
                  router.push("/siswa/jurnal")
                }
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Lihat Semua
              </button>

            </div>

            {journals.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-6 text-center">

                <div className="mb-2 text-3xl">
                  📖
                </div>

                <p className="font-semibold text-slate-700">
                  Belum ada jurnal
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Belum ada kegiatan yang dicatat.
                </p>

              </div>
            ) : (
              <div className="space-y-3">

                {journals.map((journal) => (
                  <div
                    key={journal.id}
                    className="rounded-xl border border-slate-100 p-4"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div>
                        <p className="font-semibold text-slate-800">
                          {journal.kegiatan}
                        </p>

                        {journal.kendala && (
                          <p className="mt-1 text-sm text-slate-500">
                            Kendala: {journal.kendala}
                          </p>
                        )}
                      </div>

                      <span className="whitespace-nowrap text-xs text-slate-400">
                        {formatTanggal(
                          journal.tanggal
                        )}
                      </span>

                    </div>

                  </div>
                ))}

              </div>
            )}

          </div>

          {/* PENGUMUMAN */}
          <div className="rounded-2xl bg-white p-5 shadow-sm md:p-6">

            <div className="mb-5">

              <h2 className="font-bold text-slate-800">
                Pengumuman
              </h2>

              <p className="text-sm text-slate-500">
                Informasi terbaru dari sekolah
              </p>

            </div>

            {announcements.length === 0 ? (
              <div className="rounded-xl bg-slate-50 p-6 text-center">

                <div className="mb-2 text-3xl">
                  📢
                </div>

                <p className="font-semibold text-slate-700">
                  Belum ada pengumuman
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Belum ada informasi terbaru.
                </p>

              </div>
            ) : (
              <div className="space-y-3">

                {announcements.map(
                  (announcement) => (
                    <div
                      key={announcement.id}
                      className="rounded-xl border border-slate-100 p-4"
                    >

                      <h3 className="font-semibold text-slate-800">
                        {announcement.judul}
                      </h3>

                      <p className="mt-1 text-sm leading-relaxed text-slate-500">
                        {announcement.isi}
                      </p>

                      <p className="mt-3 text-xs text-slate-400">
                        {formatTanggal(
                          announcement.createdAt
                        )}
                      </p>

                    </div>
                  )
                )}

              </div>
            )}

          </div>

        </section>

      </div>
    </main>
  );
}