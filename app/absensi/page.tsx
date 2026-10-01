"use client";

import { useEffect, useRef, useState } from "react";
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
};

type Schedule = {
  hari: string;
  jamMasuk: string;
  jamPulang: string;
};

export default function AbsensiPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [attendance, setAttendance] =
    useState<Attendance | null>(null);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // =========================
  // JADWAL PULANG
  // =========================

  const [jamPulangJadwal, setJamPulangJadwal] =
    useState<string | null>(null);

  const [waktuSekarang, setWaktuSekarang] =
    useState(new Date());

  // =========================
  // FOTO
  // =========================

  const [fotoMasuk, setFotoMasuk] =
    useState<File | null>(null);

  const [fotoPulang, setFotoPulang] =
    useState<File | null>(null);

  const [previewMasuk, setPreviewMasuk] =
    useState<string | null>(null);

  const [previewPulang, setPreviewPulang] =
    useState<string | null>(null);

  const fotoMasukRef =
    useRef<HTMLInputElement>(null);

  const fotoPulangRef =
    useRef<HTMLInputElement>(null);

  // =========================
  // ALASAN
  // =========================

  const [alasanTerlambat, setAlasanTerlambat] =
    useState("");

  const [alasanPulangTelat, setAlasanPulangTelat] =
    useState("");

  const [showTerlambat, setShowTerlambat] =
    useState(false);

  const [showPulangTelat, setShowPulangTelat] =
    useState(false);

  // =========================
  // TIMER
  // =========================

  useEffect(() => {
    const timer = setInterval(() => {
      setWaktuSekarang(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // =========================
  // LOAD USER
  // =========================

  useEffect(() => {
    const savedUser =
      localStorage.getItem("user");

    if (!savedUser) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);

      setUser(parsedUser);
    } catch (error) {
      console.error(
        "LOAD USER ERROR:",
        error
      );

      localStorage.removeItem("user");
      router.push("/login");
    }
  }, [router]);

  // =========================
  // LOAD ABSENSI + JADWAL
  // =========================

  useEffect(() => {
    if (!user?.id) return;

    loadAttendance();
    loadSchedule();
  }, [user]);

  // =========================
  // LOAD ABSENSI
  // =========================

  async function loadAttendance() {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/attendance/status?userId=${user.id}`
      );

      const data =
        await response.json();

      if (response.ok) {
        setAttendance(data.data);
      }
    } catch (error) {
      console.error(
        "LOAD ATTENDANCE ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // LOAD JADWAL
  // =========================

  async function loadSchedule() {
    try {
      const response = await fetch(
        `/api/dashboard?userId=${user.id}`
      );

      const data =
        await response.json();

      if (!response.ok) {
        console.error(
          "LOAD SCHEDULE ERROR:",
          data.message
        );

        setJamPulangJadwal(null);
        return;
      }

      const schedule: Schedule | null =
        data?.data?.todaySchedule || null;

      if (schedule?.jamPulang) {
        setJamPulangJadwal(
          schedule.jamPulang
        );
      } else {
        setJamPulangJadwal(null);
      }
    } catch (error) {
      console.error(
        "LOAD SCHEDULE ERROR:",
        error
      );

      setJamPulangJadwal(null);
    }
  }

  // =========================
  // CEK BOLEH ABSEN PULANG
  // =========================

  function bolehAbsenPulang() {
    if (!jamPulangJadwal) {
      return false;
    }

    const [hour, minute] =
      jamPulangJadwal
        .split(":")
        .map(Number);

    const waktuJadwal =
      new Date(waktuSekarang);

    waktuJadwal.setHours(
      hour,
      minute,
      0,
      0
    );

    return waktuSekarang >= waktuJadwal;
  }

  // =========================
  // HITUNG SISA WAKTU
  // =========================

  function getSisaWaktu() {
    if (!jamPulangJadwal) {
      return null;
    }

    const [hour, minute] =
      jamPulangJadwal
        .split(":")
        .map(Number);

    const waktuJadwal =
      new Date(waktuSekarang);

    waktuJadwal.setHours(
      hour,
      minute,
      0,
      0
    );

    const selisih =
      waktuJadwal.getTime() -
      waktuSekarang.getTime();

    if (selisih <= 0) {
      return null;
    }

    const totalDetik =
      Math.floor(selisih / 1000);

    const jam =
      Math.floor(totalDetik / 3600);

    const menit =
      Math.floor(
        (totalDetik % 3600) / 60
      );

    const detik =
      totalDetik % 60;

    return `${String(jam).padStart(
      2,
      "0"
    )}:${String(menit).padStart(
      2,
      "0"
    )}:${String(detik).padStart(
      2,
      "0"
    )}`;
  }

  // =========================
  // PILIH FOTO MASUK
  // =========================

  function handleFotoMasuk(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert(
        "File harus berupa gambar."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(
        "Ukuran foto maksimal 5 MB."
      );
      return;
    }

    setFotoMasuk(file);

    const preview =
      URL.createObjectURL(file);

    setPreviewMasuk(preview);
  }

  // =========================
  // PILIH FOTO PULANG
  // =========================

  function handleFotoPulang(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert(
        "File harus berupa gambar."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(
        "Ukuran foto maksimal 5 MB."
      );
      return;
    }

    setFotoPulang(file);

    const preview =
      URL.createObjectURL(file);

    setPreviewPulang(preview);
  }

  // =========================
  // CHECK IN
  // =========================

  async function checkIn(
    alasan: string | null = null
  ) {
    if (!fotoMasuk) {
      alert(
        "Silakan ambil foto terlebih dahulu."
      );

      fotoMasukRef.current?.click();

      return;
    }

    try {
      setProcessing(true);

      const formData =
        new FormData();

      formData.append(
        "userId",
        String(user.id)
      );

      formData.append(
        "foto",
        fotoMasuk
      );

      if (alasan) {
        formData.append(
          "alasanTerlambat",
          alasan
        );
      }

      const response =
        await fetch(
          "/api/attendance/check-in",
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (
        !response.ok &&
        data.perluAlasan
      ) {
        setShowTerlambat(true);
        return;
      }

      if (!response.ok) {
        alert(
          data.message ||
            "Absensi masuk gagal."
        );

        return;
      }

      alert(data.message);

      setShowTerlambat(false);
      setAlasanTerlambat("");

      await loadAttendance();
    } catch (error) {
      console.error(
        "CHECK IN ERROR:",
        error
      );

      alert(
        "Terjadi kesalahan saat melakukan absensi masuk."
      );
    } finally {
      setProcessing(false);
    }
  }

  // =========================
  // CHECK OUT
  // =========================

  async function checkOut(
    alasan: string | null = null
  ) {
    // CEGAH ABSEN PULANG SEBELUM JADWAL
    if (!bolehAbsenPulang()) {
      alert(
        jamPulangJadwal
          ? `Belum waktunya absen pulang. Jadwal pulang kamu pukul ${jamPulangJadwal}.`
          : "Jadwal pulang belum tersedia."
      );

      return;
    }

    if (!fotoPulang) {
      alert(
        "Silakan ambil foto terlebih dahulu."
      );

      fotoPulangRef.current?.click();

      return;
    }

    try {
      setProcessing(true);

      const formData =
        new FormData();

      formData.append(
        "userId",
        String(user.id)
      );

      formData.append(
        "foto",
        fotoPulang
      );

      if (alasan) {
        formData.append(
          "alasanPulangTelat",
          alasan
        );
      }

      const response =
        await fetch(
          "/api/attendance/check-out",
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (
        !response.ok &&
        data.perluAlasan
      ) {
        setShowPulangTelat(true);
        return;
      }

      if (!response.ok) {
        alert(
          data.message ||
            "Absensi pulang gagal."
        );

        return;
      }

      alert(data.message);

      setShowPulangTelat(false);
      setAlasanPulangTelat("");

      await loadAttendance();
    } catch (error) {
      console.error(
        "CHECK OUT ERROR:",
        error
      );

      alert(
        "Terjadi kesalahan saat melakukan absensi pulang."
      );
    } finally {
      setProcessing(false);
    }
  }

  // =========================
  // FORMAT WAKTU
  // =========================

  function formatWaktu(
    tanggal: string | null
  ) {
    if (!tanggal) return "-";

    return new Date(
      tanggal
    ).toLocaleTimeString(
      "id-ID",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />

          <p className="text-slate-600">
            Memuat data absensi...
          </p>
        </div>
      </main>
    );
  }

  // =========================
  // STATUS WAKTU PULANG
  // =========================

  const sudahWaktunya =
    bolehAbsenPulang();

  const sisaWaktu =
    getSisaWaktu();

  // =========================
  // RENDER
  // =========================

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">

        {/* HEADER */}

        <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 mb-5">

          <p className="text-sm text-slate-500">
            Sistem Presensi PKL
          </p>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-1">
            Absensi Kehadiran
          </h1>

          <p className="text-slate-500 mt-2">
            Halo, {user?.nama || "Siswa"} 👋
          </p>

          {/* JAM SEKARANG */}

          <div className="mt-4 rounded-xl bg-slate-50 p-4">

            <p className="text-xs text-slate-500">
              Waktu Sekarang
            </p>

            <p className="text-xl font-bold text-slate-800 mt-1">
              {waktuSekarang.toLocaleTimeString(
                "id-ID",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }
              )}
            </p>

          </div>

        </div>

        {/* STATUS */}

        <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 mb-5">

          <h2 className="font-bold text-lg text-slate-800 mb-4">
            Status Hari Ini
          </h2>

          {!attendance ? (
            <div className="bg-blue-50 rounded-xl p-4">

              <p className="font-semibold text-blue-700">
                Belum melakukan absensi masuk
              </p>

              <p className="text-sm text-blue-600 mt-1">
                Silakan ambil foto terlebih dahulu.
              </p>

            </div>
          ) : (
            <div className="space-y-3">

              <div className="flex justify-between gap-4 border-b pb-3">

                <span className="text-slate-500">
                  Status
                </span>

                <span className="font-semibold">
                  {attendance.status}
                </span>

              </div>

              <div className="flex justify-between gap-4 border-b pb-3">

                <span className="text-slate-500">
                  Jam Masuk
                </span>

                <span className="font-semibold">
                  {formatWaktu(
                    attendance.jamMasuk
                  )}
                </span>

              </div>

              <div className="flex justify-between gap-4">

                <span className="text-slate-500">
                  Jam Pulang
                </span>

                <span className="font-semibold">
                  {formatWaktu(
                    attendance.jamPulang
                  )}
                </span>

              </div>

            </div>
          )}

        </div>

        {/* JADWAL PULANG */}

        {attendance &&
          !attendance.jamPulang && (
            <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 mb-5">

              <div className="flex items-center justify-between">

                <div>
                  <h2 className="font-bold text-lg text-slate-800">
                    🕐 Jadwal Pulang
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Absensi pulang dapat dilakukan sesuai jadwal.
                  </p>
                </div>

                <div className="text-2xl">
                  🗓️
                </div>

              </div>

              <div className="mt-4 rounded-xl bg-blue-50 p-4">

                <p className="text-xs text-blue-600">
                  Jadwal Pulang
                </p>

                <p className="text-2xl font-bold text-blue-700 mt-1">
                  {jamPulangJadwal || "--:--"}
                </p>

              </div>

              {!jamPulangJadwal && (
                <div className="mt-3 rounded-xl bg-amber-50 p-4">

                  <p className="text-sm font-semibold text-amber-700">
                    Jadwal pulang belum tersedia
                  </p>

                  <p className="text-xs text-amber-600 mt-1">
                    Absensi pulang belum dapat dilakukan.
                  </p>

                </div>
              )}

              {jamPulangJadwal &&
                !sudahWaktunya && (
                  <div className="mt-3 rounded-xl bg-slate-50 p-4 text-center">

                    <p className="text-sm text-slate-500">
                      Belum waktunya absen pulang
                    </p>

                    <p className="text-xl font-bold text-slate-700 mt-1">
                      {sisaWaktu}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      Tunggu sampai pukul {jamPulangJadwal}
                    </p>

                  </div>
                )}

              {jamPulangJadwal &&
                sudahWaktunya && (
                  <div className="mt-3 rounded-xl bg-green-50 p-4">

                    <p className="text-sm font-semibold text-green-700">
                      ✓ Sudah waktunya absen pulang
                    </p>

                    <p className="text-xs text-green-600 mt-1">
                      Silakan ambil foto dan lakukan absensi pulang.
                    </p>

                  </div>
                )}

            </div>
          )}

        {/* FOTO MASUK */}

        {!attendance && (
          <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 mb-5">

            <h2 className="font-bold text-lg text-slate-800">
              📸 Foto Absensi Masuk
            </h2>

            <p className="text-sm text-slate-500 mt-1 mb-4">
              Ambil foto sebagai bukti kehadiran.
            </p>

            <input
              ref={fotoMasukRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleFotoMasuk}
              className="hidden"
            />

            {previewMasuk && (
              <div className="mb-4">

                <img
                  src={previewMasuk}
                  alt="Preview foto masuk"
                  className="w-full max-h-[420px] object-cover rounded-xl"
                />

                <button
                  type="button"
                  onClick={() => {
                    setFotoMasuk(null);
                    setPreviewMasuk(null);
                  }}
                  className="mt-2 text-sm text-red-500"
                >
                  Hapus foto
                </button>

              </div>
            )}

            <button
              type="button"
              onClick={() =>
                fotoMasukRef.current?.click()
              }
              className="w-full py-3 rounded-xl border-2 border-dashed border-blue-300 text-blue-600 font-semibold hover:bg-blue-50 transition"
            >
              📷{" "}
              {fotoMasuk
                ? "Ganti Foto"
                : "Ambil Foto"}
            </button>

            {fotoMasuk && (
              <button
                type="button"
                disabled={processing}
                onClick={() => checkIn()}
                className="w-full mt-3 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {processing
                  ? "Memproses..."
                  : "✓ Absen Masuk"}
              </button>
            )}

          </div>
        )}

        {/* FOTO PULANG */}

        {attendance &&
          !attendance.jamPulang && (
            <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 mb-5">

              <h2 className="font-bold text-lg text-slate-800">
                📸 Foto Absensi Pulang
              </h2>

              <p className="text-sm text-slate-500 mt-1 mb-4">
                Ambil foto sebagai bukti absensi pulang.
              </p>

              <input
                ref={fotoPulangRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleFotoPulang}
                className="hidden"
              />

              {previewPulang && (
                <div className="mb-4">

                  <img
                    src={previewPulang}
                    alt="Preview foto pulang"
                    className="w-full max-h-[420px] object-cover rounded-xl"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setFotoPulang(null);
                      setPreviewPulang(null);
                    }}
                    className="mt-2 text-sm text-red-500"
                  >
                    Hapus foto
                  </button>

                </div>
              )}

              {/* TOMBOL AMBIL FOTO */}

              <button
                type="button"
                disabled={!sudahWaktunya}
                onClick={() => {
                  if (!sudahWaktunya) {
                    alert(
                      jamPulangJadwal
                        ? `Belum waktunya absen pulang. Jadwal pulang kamu pukul ${jamPulangJadwal}.`
                        : "Jadwal pulang belum tersedia."
                    );

                    return;
                  }

                  fotoPulangRef.current?.click();
                }}
                className={`w-full py-3 rounded-xl border-2 border-dashed font-semibold transition ${
                  sudahWaktunya
                    ? "border-green-300 text-green-600 hover:bg-green-50"
                    : "border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed"
                }`}
              >
                📷{" "}
                {sudahWaktunya
                  ? fotoPulang
                    ? "Ganti Foto"
                    : "Ambil Foto"
                  : "🔒 Belum Waktunya"}
              </button>

              {/* INFO BELUM WAKTU */}

              {!sudahWaktunya &&
                jamPulangJadwal && (
                  <div className="mt-3 rounded-xl bg-amber-50 p-3">

                    <p className="text-sm text-amber-700 text-center">
                      🔒 Foto dan tombol absensi pulang akan aktif pada pukul{" "}
                      <span className="font-bold">
                        {jamPulangJadwal}
                      </span>
                    </p>

                  </div>
                )}

              {/* TOMBOL ABSEN PULANG */}

              {fotoPulang && (
                <button
                  type="button"
                  disabled={
                    processing ||
                    !sudahWaktunya
                  }
                  onClick={() => {
                    if (!sudahWaktunya) {
                      alert(
                        jamPulangJadwal
                          ? `Belum waktunya absen pulang. Jadwal pulang kamu pukul ${jamPulangJadwal}.`
                          : "Jadwal pulang belum tersedia."
                      );

                      return;
                    }

                    checkOut();
                  }}
                  className={`w-full mt-3 py-3 rounded-xl text-white font-semibold transition ${
                    sudahWaktunya
                      ? "bg-green-600 hover:bg-green-700 disabled:opacity-50"
                      : "bg-slate-300 cursor-not-allowed"
                  }`}
                >
                  {processing
                    ? "Memproses..."
                    : sudahWaktunya
                    ? "✓ Absen Pulang"
                    : "🔒 Belum Waktunya"}
                </button>
              )}

            </div>
          )}

        {/* SELESAI */}

        {attendance &&
          attendance.jamPulang && (
            <div className="bg-white rounded-2xl shadow-sm p-6 text-center">

              <div className="text-5xl mb-3">
                ✅
              </div>

              <h2 className="text-xl font-bold text-slate-800">
                Absensi Hari Ini Selesai
              </h2>

              <p className="text-slate-500 mt-2">
                Kamu sudah melakukan absensi masuk dan pulang.
              </p>

            </div>
          )}

      </div>

      {/* =========================
          MODAL TERLAMBAT
      ========================= */}

      {showTerlambat && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-md rounded-2xl p-5 sm:p-6">

            <h2 className="text-xl font-bold text-slate-800">
              Alasan Keterlambatan
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Kamu tercatat terlambat. Silakan masukkan alasan.
            </p>

            <textarea
              value={alasanTerlambat}
              onChange={(e) =>
                setAlasanTerlambat(
                  e.target.value
                )
              }
              placeholder="Contoh: Terjadi kendala perjalanan..."
              className="w-full mt-4 min-h-28 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex gap-3 mt-4">

              <button
                type="button"
                onClick={() => {
                  setShowTerlambat(false);
                  setAlasanTerlambat("");
                }}
                className="flex-1 py-3 rounded-xl border font-semibold"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={
                  processing ||
                  !alasanTerlambat.trim()
                }
                onClick={() =>
                  checkIn(
                    alasanTerlambat.trim()
                  )
                }
                className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold disabled:opacity-50"
              >
                Kirim
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =========================
          MODAL PULANG TELAT
      ========================= */}

      {showPulangTelat && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-md rounded-2xl p-5 sm:p-6">

            <h2 className="text-xl font-bold text-slate-800">
              Alasan Pulang Telat
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Kamu pulang melewati jadwal. Silakan masukkan alasan.
            </p>

            <textarea
              value={alasanPulangTelat}
              onChange={(e) =>
                setAlasanPulangTelat(
                  e.target.value
                )
              }
              placeholder="Contoh: Masih menyelesaikan tugas..."
              className="w-full mt-4 min-h-28 border rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-500"
            />

            <div className="flex gap-3 mt-4">

              <button
                type="button"
                onClick={() => {
                  setShowPulangTelat(false);
                  setAlasanPulangTelat("");
                }}
                className="flex-1 py-3 rounded-xl border font-semibold"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={
                  processing ||
                  !alasanPulangTelat.trim()
                }
                onClick={() =>
                  checkOut(
                    alasanPulangTelat.trim()
                  )
                }
                className="flex-1 py-3 rounded-xl bg-green-600 text-white font-semibold disabled:opacity-50"
              >
                Kirim
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}