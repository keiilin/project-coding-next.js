"use client";

import { useEffect, useState } from "react";
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
    nama: string;
    kelas: string | null;
    tempatPkl: string | null;
  };
};

type AttendanceHistory = {
  id: number;
  attendanceId: number | null;
  action: string;
  reason: string;
  tanggal: string;
  jamMasuk: string | null;
  jamPulang: string | null;
  status: string;
  alasanTerlambat: string | null;
  alasanPulangTelat: string | null;
  fotoMasuk: string | null;
  fotoPulang: string | null;
  createdAt: string;
  user: {
    id: number;
    nama: string;
    username: string;
    nis: string | null;
    kelas: string | null;
    jurusan: string | null;
    tempatPkl: string | null;
  };
  admin: {
    id: number;
    nama: string;
    username: string;
  };
};

export default function AdminPage() {
  const router = useRouter();

  const [attendances, setAttendances] =
    useState<Attendance[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [user, setUser] =
    useState<any>(null);

  const [selectedPhoto, setSelectedPhoto] =
    useState<string | null>(null);

  // =========================
  // EDIT
  // =========================

  const [editingAttendance, setEditingAttendance] =
    useState<Attendance | null>(null);

  const [editJamMasuk, setEditJamMasuk] =
    useState("");

  const [editJamPulang, setEditJamPulang] =
    useState("");

  const [editStatus, setEditStatus] =
    useState("HADIR");

  const [editAlasanTerlambat, setEditAlasanTerlambat] =
    useState("");

  const [editAlasanPulangTelat, setEditAlasanPulangTelat] =
    useState("");

  const [editReason, setEditReason] =
    useState("");

  const [savingEdit, setSavingEdit] =
    useState(false);

  // =========================
  // DELETE
  // =========================

  const [deletingAttendance, setDeletingAttendance] =
    useState<Attendance | null>(null);

  const [deleteReason, setDeleteReason] =
    useState("");

  const [deleting, setDeleting] =
    useState(false);

  // =========================
  // HISTORY
  // =========================

  const [histories, setHistories] =
    useState<AttendanceHistory[]>([]);

  const [showHistory, setShowHistory] =
    useState(false);

  const [historyLoading, setHistoryLoading] =
    useState(false);

  // =========================
  // CEK LOGIN
  // =========================

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const userData =
        JSON.parse(storedUser);

      if (userData.role !== "ADMIN") {
        router.push("/login");
        return;
      }

      setUser(userData);
    } catch {
      localStorage.removeItem("user");
      router.push("/login");
    }
  }, [router]);

  // =========================
  // GET ATTENDANCES
  // =========================

  const getAttendances = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/admin/attendance"
      );

      const data =
        await response.json();

      if (!response.ok) {
        console.error(data.message);
        return;
      }

      setAttendances(
        data.data || []
      );
    } catch (error) {
      console.error(
        "GET ATTENDANCES ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getAttendances();
    }
  }, [user]);

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  // =========================
  // FORMAT TIME
  // =========================

  const formatTime = (
    date: string | null
  ) => {
    if (!date) return "-";

    return new Date(
      date
    ).toLocaleTimeString(
      "id-ID",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (
    date: string
  ) => {
    return new Date(
      date
    ).toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  };

  // =========================
  // FORMAT DATETIME LOCAL
  // =========================

  const formatDateTimeLocal = (
    date: string | null
  ) => {
    if (!date) return "";

    const value =
      new Date(date);

    const year =
      value.getFullYear();

    const month =
      String(
        value.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        value.getDate()
      ).padStart(2, "0");

    const hours =
      String(
        value.getHours()
      ).padStart(2, "0");

    const minutes =
      String(
        value.getMinutes()
      ).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // =========================
  // FORMAT HISTORY DATETIME
  // =========================

  const formatHistoryDateTime = (
    date: string
  ) => {
    return new Date(
      date
    ).toLocaleString(
      "id-ID",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =========================
  // STATISTIK
  // =========================

  const totalAttendance =
    attendances.length;

  const sudahPulang =
    attendances.filter(
      (item) => item.jamPulang
    ).length;

  const masihPKL =
    attendances.filter(
      (item) => !item.jamPulang
    ).length;

  const terlambat =
    attendances.filter(
      (item) =>
        item.alasanTerlambat
    ).length;

  const pulangTelat =
    attendances.filter(
      (item) =>
        item.alasanPulangTelat
    ).length;

  // =========================
  // BUKA EDIT
  // =========================

  const openEdit = (
    attendance: Attendance
  ) => {
    setEditingAttendance(
      attendance
    );

    setEditJamMasuk(
      formatDateTimeLocal(
        attendance.jamMasuk
      )
    );

    setEditJamPulang(
      formatDateTimeLocal(
        attendance.jamPulang
      )
    );

    setEditStatus(
      attendance.status ||
        "HADIR"
    );

    setEditAlasanTerlambat(
      attendance.alasanTerlambat ||
        ""
    );

    setEditAlasanPulangTelat(
      attendance.alasanPulangTelat ||
        ""
    );

    setEditReason("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // TUTUP EDIT
  // =========================

  const closeEdit = () => {
    if (savingEdit) return;

    setEditingAttendance(null);
    setEditJamMasuk("");
    setEditJamPulang("");
    setEditStatus("HADIR");
    setEditAlasanTerlambat("");
    setEditAlasanPulangTelat("");
    setEditReason("");
  };

  // =========================
  // SIMPAN EDIT
  // =========================

  const handleEdit = async () => {
    if (!editingAttendance) {
      return;
    }

    if (!editReason.trim()) {
      alert(
        "Alasan perubahan wajib diisi."
      );
      return;
    }

    try {
      setSavingEdit(true);

      const response =
        await fetch(
          "/api/admin/attendance/edit",
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              attendanceId:
                editingAttendance.id,

              adminId:
                user.id,

              jamMasuk:
                editJamMasuk ||
                null,

              jamPulang:
                editJamPulang ||
                null,

              status:
                editStatus,

              alasanTerlambat:
                editAlasanTerlambat,

              alasanPulangTelat:
                editAlasanPulangTelat,

              reason:
                editReason.trim(),
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Gagal mengubah absensi."
        );
        return;
      }

      alert(
        data.message ||
          "Absensi berhasil diubah."
      );

      closeEdit();

      await getAttendances();
    } catch (error) {
      console.error(
        "EDIT ATTENDANCE ERROR:",
        error
      );

      alert(
        "Terjadi kesalahan saat mengubah absensi."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  // =========================
  // BUKA DELETE
  // =========================

  const openDelete = (
    attendance: Attendance
  ) => {
    setDeletingAttendance(
      attendance
    );

    setDeleteReason("");
  };

  // =========================
  // TUTUP DELETE
  // =========================

  const closeDelete = () => {
    if (deleting) return;

    setDeletingAttendance(null);
    setDeleteReason("");
  };

  // =========================
  // HAPUS ABSENSI
  // =========================

  const handleDelete = async () => {
    if (!deletingAttendance) {
      return;
    }

    if (!deleteReason.trim()) {
      alert(
        "Alasan penghapusan wajib diisi."
      );
      return;
    }

    try {
      setDeleting(true);

      const response =
        await fetch(
          "/api/admin/attendance/delete",
          {
            method: "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              attendanceId:
                deletingAttendance.id,

              adminId:
                user.id,

              reason:
                deleteReason.trim(),
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Gagal menghapus absensi."
        );
        return;
      }

      alert(
        data.message ||
          "Absensi berhasil dihapus."
      );

      closeDelete();

      await getAttendances();
    } catch (error) {
      console.error(
        "DELETE ATTENDANCE ERROR:",
        error
      );

      alert(
        "Terjadi kesalahan saat menghapus absensi."
      );
    } finally {
      setDeleting(false);
    }
  };

  // =========================
  // GET HISTORY
  // =========================

  const getHistory = async () => {
    if (!user?.id) return;

    try {
      setHistoryLoading(true);

      const response =
        await fetch(
          `/api/admin/attendance/history?adminId=${user.id}`
        );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Gagal mengambil histori."
        );
        return;
      }

      setHistories(
        data.data || []
      );

      setShowHistory(true);
    } catch (error) {
      console.error(
        "GET HISTORY ERROR:",
        error
      );

      alert(
        "Terjadi kesalahan saat mengambil histori."
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-slate-600">
          Memuat dashboard...
        </div>
      </main>
    );
  }

  // =========================
  // RENDER
  // =========================

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-10">

      <div className="max-w-7xl mx-auto">

        {/* =========================
            HEADER
        ========================= */}

        <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 mb-6">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="text-sm text-blue-600 font-semibold">
                PKL ATTENDANCE SYSTEM
              </p>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-1">
                Dashboard Admin
              </h1>

              <p className="text-sm sm:text-base text-slate-500 mt-2">
                Monitoring Presensi Siswa PKL
              </p>

            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4">

              <div className="text-left sm:text-right">

                <p className="font-bold text-slate-800">
                  {user.nama}
                </p>

                <p className="text-sm text-slate-500">
                  Administrator
                </p>

              </div>

              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 sm:px-5 py-2.5 rounded-xl font-semibold transition"
              >
                Logout
              </button>

            </div>

          </div>

        </div>

        {/* =========================
            STATISTIK
        ========================= */}

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-5 mb-6">

          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">

            <p className="text-xs sm:text-sm text-slate-500">
              Total Absensi
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2">
              {totalAttendance}
            </h2>

          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">

            <p className="text-xs sm:text-sm text-slate-500">
              Sudah Pulang
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">
              {sudahPulang}
            </h2>

          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">

            <p className="text-xs sm:text-sm text-slate-500">
              Masih PKL
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2">
              {masihPKL}
            </h2>

          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">

            <p className="text-xs sm:text-sm text-slate-500">
              Terlambat
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-orange-500 mt-2">
              {terlambat}
            </h2>

          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 col-span-2 lg:col-span-1">

            <p className="text-xs sm:text-sm text-slate-500">
              Pulang Telat
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-purple-600 mt-2">
              {pulangTelat}
            </h2>

          </div>

        </div>

        {/* =========================
            DATA ABSENSI
        ========================= */}

        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

            <div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                Data Kehadiran Siswa
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Monitoring aktivitas presensi siswa PKL
              </p>

            </div>

            <div className="flex flex-col sm:flex-row gap-2">

              <button
                onClick={getHistory}
                disabled={historyLoading}
                className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-semibold transition"
              >
                {historyLoading
                  ? "Memuat..."
                  : "📜 Histori"}
              </button>

              <button
                onClick={getAttendances}
                disabled={loading}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-semibold transition"
              >
                {loading
                  ? "Memuat..."
                  : "↻ Refresh Data"}
              </button>

            </div>

          </div>

          {/* =========================
              LOADING
          ========================= */}

          {loading ? (

            <div className="py-12 text-center">

              <div className="animate-spin w-9 h-9 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />

              <p className="text-slate-500">
                Memuat data absensi...
              </p>

            </div>

          ) : attendances.length === 0 ? (

            <div className="py-12 text-center">

              <div className="text-5xl mb-4">
                📋
              </div>

              <p className="font-semibold text-slate-700">
                Belum ada data absensi
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Data presensi siswa akan muncul di sini.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto rounded-xl border">

              <table className="w-full min-w-[1450px] border-collapse">

                <thead>

                  <tr className="bg-slate-100">

                    <th className="border-b p-3 text-left text-sm">
                      Nama
                    </th>

                    <th className="border-b p-3 text-left text-sm">
                      Kelas
                    </th>

                    <th className="border-b p-3 text-left text-sm">
                      Tempat PKL
                    </th>

                    <th className="border-b p-3 text-left text-sm">
                      Tanggal
                    </th>

                    <th className="border-b p-3 text-left text-sm">
                      Masuk
                    </th>

                    <th className="border-b p-3 text-left text-sm">
                      Foto Masuk
                    </th>

                    <th className="border-b p-3 text-left text-sm">
                      Pulang
                    </th>

                    <th className="border-b p-3 text-left text-sm">
                      Foto Pulang
                    </th>

                    <th className="border-b p-3 text-left text-sm">
                      Keterangan
                    </th>

                    <th className="border-b p-3 text-left text-sm">
                      Status
                    </th>

                    <th className="border-b p-3 text-left text-sm">
                      Aksi
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {attendances.map(
                    (item) => (

                      <tr
                        key={item.id}
                        className="hover:bg-slate-50 transition"
                      >

                        {/* NAMA */}

                        <td className="border-b p-3 font-semibold text-slate-800">
                          {item.user?.nama ||
                            "-"}
                        </td>

                        {/* KELAS */}

                        <td className="border-b p-3">
                          {item.user?.kelas ||
                            "-"}
                        </td>

                        {/* TEMPAT PKL */}

                        <td className="border-b p-3">
                          {item.user?.tempatPkl ||
                            "-"}
                        </td>

                        {/* TANGGAL */}

                        <td className="border-b p-3 whitespace-nowrap">
                          {formatDate(
                            item.tanggal
                          )}
                        </td>

                        {/* MASUK */}

                        <td className="border-b p-3 whitespace-nowrap">
                          {formatTime(
                            item.jamMasuk
                          )}
                        </td>

                        {/* FOTO MASUK */}

                        <td className="border-b p-3">

                          {item.fotoMasuk ? (

                            <button
                              onClick={() =>
                                setSelectedPhoto(
                                  item.fotoMasuk
                                )
                              }
                              className="group"
                            >

                              <img
                                src={
                                  item.fotoMasuk
                                }
                                alt="Foto masuk"
                                className="w-16 h-16 object-cover rounded-xl border group-hover:scale-105 transition"
                              />

                            </button>

                          ) : (

                            <span className="text-slate-400">
                              -
                            </span>

                          )}

                        </td>

                        {/* PULANG */}

                        <td className="border-b p-3 whitespace-nowrap">
                          {formatTime(
                            item.jamPulang
                          )}
                        </td>

                        {/* FOTO PULANG */}

                        <td className="border-b p-3">

                          {item.fotoPulang ? (

                            <button
                              onClick={() =>
                                setSelectedPhoto(
                                  item.fotoPulang
                                )
                              }
                              className="group"
                            >

                              <img
                                src={
                                  item.fotoPulang
                                }
                                alt="Foto pulang"
                                className="w-16 h-16 object-cover rounded-xl border group-hover:scale-105 transition"
                              />

                            </button>

                          ) : (

                            <span className="text-slate-400">
                              -
                            </span>

                          )}

                        </td>

                        {/* KETERANGAN */}

                        <td className="border-b p-3 max-w-xs">

                          {item.alasanTerlambat && (

                            <div className="mb-3">

                              <span className="text-orange-600 font-semibold text-xs">
                                TERLAMBAT
                              </span>

                              <p className="text-sm text-slate-600 mt-1">
                                {
                                  item.alasanTerlambat
                                }
                              </p>

                            </div>

                          )}

                          {item.alasanPulangTelat && (

                            <div>

                              <span className="text-purple-600 font-semibold text-xs">
                                PULANG TELAT
                              </span>

                              <p className="text-sm text-slate-600 mt-1">
                                {
                                  item.alasanPulangTelat
                                }
                              </p>

                            </div>

                          )}

                          {!item.alasanTerlambat &&
                            !item.alasanPulangTelat && (

                              <span className="text-slate-400">
                                -
                              </span>

                            )}

                        </td>

                        {/* STATUS */}

                        <td className="border-b p-3">

                          {!item.jamPulang ? (

                            <span className="inline-flex bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap">
                              Sedang PKL
                            </span>

                          ) : (

                            <span className="inline-flex bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap">
                              Selesai
                            </span>

                          )}

                        </td>

                        {/* AKSI */}

                        <td className="border-b p-3">

                          <div className="flex flex-col gap-2 min-w-[105px]">

                            <button
                              type="button"
                              onClick={() =>
                                openEdit(item)
                              }
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition"
                            >
                              ✏️ Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openDelete(item)
                              }
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-semibold transition"
                            >
                              🗑️ Hapus
                            </button>

                          </div>

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

      {/* =====================================================
          MODAL FOTO
      ===================================================== */}

      {selectedPhoto && (

        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() =>
            setSelectedPhoto(null)
          }
        >

          <div
            className="relative max-w-3xl max-h-[90vh]"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <img
              src={selectedPhoto}
              alt="Foto absensi"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />

            <button
              onClick={() =>
                setSelectedPhoto(null)
              }
              className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-white text-slate-800 font-bold shadow-lg hover:bg-slate-100"
            >
              ✕
            </button>

          </div>

        </div>

      )}

      {/* =====================================================
          MODAL EDIT
      ===================================================== */}

      {editingAttendance && (

        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">

            <div className="p-5 sm:p-6 border-b">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                    ✏️ Edit Absensi
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    {editingAttendance.user?.nama}
                  </p>

                  <p className="text-sm text-slate-400">
                    {formatDate(
                      editingAttendance.tanggal
                    )}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={closeEdit}
                  disabled={savingEdit}
                  className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold"
                >
                  ✕
                </button>

              </div>

            </div>

            <div className="p-5 sm:p-6 space-y-5">

              {/* JAM MASUK */}

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Jam Masuk
                </label>

                <input
                  type="datetime-local"
                  value={editJamMasuk}
                  onChange={(e) =>
                    setEditJamMasuk(
                      e.target.value
                    )
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              {/* JAM PULANG */}

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Jam Pulang
                </label>

                <input
                  type="datetime-local"
                  value={editJamPulang}
                  onChange={(e) =>
                    setEditJamPulang(
                      e.target.value
                    )
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              {/* STATUS */}

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Status
                </label>

                <select
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(
                      e.target.value
                    )
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >

                  <option value="HADIR">
                    HADIR
                  </option>

                  <option value="TERLAMBAT">
                    TERLAMBAT
                  </option>

                  <option value="IZIN">
                    IZIN
                  </option>

                  <option value="SAKIT">
                    SAKIT
                  </option>

                  <option value="ALPA">
                    ALPA
                  </option>

                </select>

              </div>

              {/* ALASAN TERLAMBAT */}

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Alasan Terlambat
                </label>

                <textarea
                  value={
                    editAlasanTerlambat
                  }
                  onChange={(e) =>
                    setEditAlasanTerlambat(
                      e.target.value
                    )
                  }
                  placeholder="Kosongkan jika tidak ada..."
                  className="w-full min-h-24 border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              {/* ALASAN PULANG TELAT */}

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Alasan Pulang Telat
                </label>

                <textarea
                  value={
                    editAlasanPulangTelat
                  }
                  onChange={(e) =>
                    setEditAlasanPulangTelat(
                      e.target.value
                    )
                  }
                  placeholder="Kosongkan jika tidak ada..."
                  className="w-full min-h-24 border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              {/* ALASAN PERUBAHAN */}

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Alasan Perubahan
                  <span className="text-red-500">
                    {" "}
                    *
                  </span>
                </label>

                <textarea
                  value={editReason}
                  onChange={(e) =>
                    setEditReason(
                      e.target.value
                    )
                  }
                  placeholder="Contoh: Koreksi jam masuk berdasarkan bukti absensi..."
                  className="w-full min-h-28 border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <p className="text-xs text-slate-400 mt-1">
                  Data sebelum perubahan akan otomatis masuk ke histori.
                </p>

              </div>

            </div>

            <div className="p-5 sm:p-6 border-t flex flex-col sm:flex-row gap-3">

              <button
                type="button"
                onClick={closeEdit}
                disabled={savingEdit}
                className="flex-1 py-3 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleEdit}
                disabled={
                  savingEdit ||
                  !editReason.trim()
                }
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50"
              >
                {savingEdit
                  ? "Menyimpan..."
                  : "💾 Simpan Perubahan"}
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          MODAL DELETE
      ===================================================== */}

      {deletingAttendance && (

        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">

            <div className="p-5 sm:p-6">

              <div className="text-center">

                <div className="text-5xl mb-3">
                  ⚠️
                </div>

                <h2 className="text-xl font-bold text-slate-800">
                  Hapus Absensi?
                </h2>

                <p className="text-sm text-slate-500 mt-2">
                  Kamu akan menghapus absensi:
                </p>

                <p className="font-bold text-slate-800 mt-1">
                  {
                    deletingAttendance
                      .user?.nama
                  }
                </p>

                <p className="text-sm text-slate-500">
                  {formatDate(
                    deletingAttendance.tanggal
                  )}
                </p>

              </div>

              <div className="mt-5 bg-orange-50 border border-orange-200 rounded-xl p-4">

                <p className="text-sm text-orange-700">
                  Data absensi akan dihapus dari data aktif, tetapi salinan datanya tetap disimpan di <strong>Histori Absensi</strong>.
                </p>

              </div>

              <div className="mt-5">

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Alasan Penghapusan
                  <span className="text-red-500">
                    {" "}
                    *
                  </span>
                </label>

                <textarea
                  value={deleteReason}
                  onChange={(e) =>
                    setDeleteReason(
                      e.target.value
                    )
                  }
                  placeholder="Contoh: Data absensi tidak valid..."
                  className="w-full min-h-28 border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500"
                />

              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-5">

                <button
                  type="button"
                  onClick={closeDelete}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={
                    deleting ||
                    !deleteReason.trim()
                  }
                  className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold disabled:opacity-50"
                >
                  {deleting
                    ? "Menghapus..."
                    : "🗑️ Hapus Absensi"}
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          MODAL HISTORY
      ===================================================== */}

      {showHistory && (

        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col">

            {/* HEADER */}

            <div className="p-5 sm:p-6 border-b flex items-center justify-between gap-4">

              <div>

                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                  📜 Histori Absensi
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Riwayat perubahan dan penghapusan data absensi
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowHistory(false)
                }
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                ✕
              </button>

            </div>

            {/* CONTENT */}

            <div className="overflow-y-auto p-4 sm:p-6">

              {historyLoading ? (

                <div className="py-12 text-center">

                  <div className="animate-spin w-9 h-9 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />

                  <p className="text-slate-500">
                    Memuat histori...
                  </p>

                </div>

              ) : histories.length === 0 ? (

                <div className="py-12 text-center">

                  <div className="text-5xl mb-4">
                    📜
                  </div>

                  <p className="font-semibold text-slate-700">
                    Belum ada histori
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    Perubahan atau penghapusan absensi akan muncul di sini.
                  </p>

                </div>

              ) : (

                <div className="space-y-4">

                  {histories.map(
                    (history) => (

                      <div
                        key={history.id}
                        className="border rounded-2xl p-4 sm:p-5 bg-slate-50"
                      >

                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

                          <div>

                            <div className="flex flex-wrap items-center gap-2">

                              <span className="font-bold text-slate-800">
                                {
                                  history
                                    .user
                                    ?.nama ||
                                  "-"
                                }
                              </span>

                              {history.user
                                ?.kelas && (

                                <span className="text-xs bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full">
                                  {
                                    history
                                      .user
                                      .kelas
                                  }
                                </span>

                              )}

                              <span
                                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                                  history.action ===
                                  "DIHAPUS"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {
                                  history.action
                                }
                              </span>

                            </div>

                            <p className="text-sm text-slate-500 mt-1">
                              {formatDate(
                                history.tanggal
                              )}
                            </p>

                          </div>

                          <div className="text-left lg:text-right">

                            <p className="text-xs text-slate-400">
                              Tindakan oleh
                            </p>

                            <p className="text-sm font-semibold text-slate-700">
                              {
                                history
                                  .admin
                                  ?.nama ||
                                "-"
                              }
                            </p>

                            <p className="text-xs text-slate-400 mt-1">
                              {formatHistoryDateTime(
                                history.createdAt
                              )}
                            </p>

                          </div>

                        </div>

                        {/* DATA LAMA */}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">

                          <div className="bg-white rounded-xl p-3 border">

                            <p className="text-xs text-slate-400">
                              Jam Masuk
                            </p>

                            <p className="font-semibold text-slate-700 mt-1">
                              {formatTime(
                                history.jamMasuk
                              )}
                            </p>

                          </div>

                          <div className="bg-white rounded-xl p-3 border">

                            <p className="text-xs text-slate-400">
                              Jam Pulang
                            </p>

                            <p className="font-semibold text-slate-700 mt-1">
                              {formatTime(
                                history.jamPulang
                              )}
                            </p>

                          </div>

                          <div className="bg-white rounded-xl p-3 border">

                            <p className="text-xs text-slate-400">
                              Status
                            </p>

                            <p className="font-semibold text-slate-700 mt-1">
                              {
                                history.status ||
                                "-"
                              }
                            </p>

                          </div>

                          <div className="bg-white rounded-xl p-3 border">

                            <p className="text-xs text-slate-400">
                              ID Absensi
                            </p>

                            <p className="font-semibold text-slate-700 mt-1">
                              #
                              {
                                history
                                  .attendanceId ||
                                "-"
                              }
                            </p>

                          </div>

                        </div>

                        {/* KETERANGAN */}

                        {(history.alasanTerlambat ||
                          history.alasanPulangTelat) && (

                          <div className="mt-4 bg-white border rounded-xl p-4">

                            <p className="text-sm font-bold text-slate-700 mb-2">
                              Keterangan Absensi
                            </p>

                            {history.alasanTerlambat && (

                              <div className="mb-2">

                                <span className="text-xs font-bold text-orange-600">
                                  TERLAMBAT
                                </span>

                                <p className="text-sm text-slate-600 mt-1">
                                  {
                                    history
                                      .alasanTerlambat
                                  }
                                </p>

                              </div>

                            )}

                            {history.alasanPulangTelat && (

                              <div>

                                <span className="text-xs font-bold text-purple-600">
                                  PULANG TELAT
                                </span>

                                <p className="text-sm text-slate-600 mt-1">
                                  {
                                    history
                                      .alasanPulangTelat
                                  }
                                </p>

                              </div>

                            )}

                          </div>

                        )}

                        {/* ALASAN ADMIN */}

                        <div className="mt-4 bg-white border rounded-xl p-4">

                          <p className="text-sm font-bold text-slate-700">
                            Alasan Tindakan Admin
                          </p>

                          <p className="text-sm text-slate-600 mt-1">
                            {history.reason}
                          </p>

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>

          </div>

        </div>

      )}

    </main>
  );
}