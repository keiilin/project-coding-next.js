"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  nama: string;
  username: string;
  nis: string | null;
  kelas: string | null;
  jurusan: string | null;
  tempatPkl: string | null;
  aktif: boolean;
  role: string;
};

type Schedule = {
  id: number;
  userId: number;
  hari: string;
  jamMasuk: string;
  jamPulang: string;
  createdAt: string;
  updatedAt: string;
  user: User;
};

const DAYS = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];

export default function AdminJadwalPage() {
  const router = useRouter();

  // =========================
  // DATA
  // =========================

  const [user, setUser] = useState<any>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [students, setStudents] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);

  // =========================
  // TAMBAH / EDIT
  // =========================

  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] =
    useState<Schedule | null>(null);

  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedHari, setSelectedHari] = useState("Senin");
  const [jamMasuk, setJamMasuk] = useState("08:00");
  const [jamPulang, setJamPulang] = useState("16:00");

  const [saving, setSaving] = useState(false);

  // =========================
  // DELETE
  // =========================

  const [deletingSchedule, setDeletingSchedule] =
    useState<Schedule | null>(null);

  const [deleting, setDeleting] = useState(false);

  // =========================
  // CEK LOGIN
  // =========================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const userData = JSON.parse(storedUser);

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
  // GET JADWAL
  // =========================

  const getSchedules = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const response = await fetch(
        `/api/admin/schedules?userId=${user.id}`
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Gagal mengambil data jadwal."
        );
        return;
      }

      setSchedules(data.data || []);
    } catch (error) {
      console.error(
        "GET SCHEDULES ERROR:",
        error
      );

      alert(
        "Terjadi kesalahan saat mengambil data jadwal."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GET SISWA
  // =========================

  const getStudents = async () => {
    if (!user?.id) return;

    try {
      setLoadingStudents(true);

      const response = await fetch(
        `/api/admin/users?userId=${user.id}`
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(data.message);
        return;
      }

      const studentData = (data.data || []).filter(
        (item: User) => item.role === "SISWA"
      );

      setStudents(studentData);
    } catch (error) {
      console.error(
        "GET STUDENTS ERROR:",
        error
      );
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (user) {
      getSchedules();
      getStudents();
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
  // FORMAT JAM
  // =========================

  const formatTime = (time: string) => {
    if (!time) return "-";

    return time.slice(0, 5);
  };

  // =========================
  // BUKA TAMBAH
  // =========================

  const openAdd = () => {
    setEditingSchedule(null);

    setSelectedUserId("");
    setSelectedHari("Senin");
    setJamMasuk("08:00");
    setJamPulang("16:00");

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // BUKA EDIT
  // =========================

  const openEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);

    setSelectedUserId(
      String(schedule.userId)
    );

    setSelectedHari(schedule.hari);

    setJamMasuk(
      formatTime(schedule.jamMasuk)
    );

    setJamPulang(
      formatTime(schedule.jamPulang)
    );

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // TUTUP FORM
  // =========================

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingSchedule(null);

    setSelectedUserId("");
    setSelectedHari("Senin");
    setJamMasuk("08:00");
    setJamPulang("16:00");
  };

  // =========================
  // SIMPAN JADWAL
  // =========================

  const handleSave = async () => {
    if (!selectedUserId) {
      alert("Siswa wajib dipilih.");
      return;
    }

    if (!selectedHari) {
      alert("Hari wajib dipilih.");
      return;
    }

    if (!jamMasuk || !jamPulang) {
      alert(
        "Jam masuk dan jam pulang wajib diisi."
      );
      return;
    }

    if (jamMasuk >= jamPulang) {
      alert(
        "Jam pulang harus lebih besar dari jam masuk."
      );
      return;
    }

    try {
      setSaving(true);

      const isEdit = Boolean(editingSchedule);

      const response = await fetch(
        "/api/admin/schedules",
        {
          method: isEdit ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            isEdit
              ? {
                  adminId: user.id,
                  id: editingSchedule?.id,
                  hari: selectedHari,
                  jamMasuk,
                  jamPulang,
                }
              : {
                  adminId: user.id,
                  userId: Number(
                    selectedUserId
                  ),
                  hari: selectedHari,
                  jamMasuk,
                  jamPulang,
                }
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Gagal menyimpan jadwal."
        );
        return;
      }

      alert(
        data.message ||
          (isEdit
            ? "Jadwal berhasil diubah."
            : "Jadwal berhasil ditambahkan.")
      );

      closeForm();

      await getSchedules();
    } catch (error) {
      console.error(
        "SAVE SCHEDULE ERROR:",
        error
      );

      alert(
        "Terjadi kesalahan saat menyimpan jadwal."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // BUKA DELETE
  // =========================

  const openDelete = (schedule: Schedule) => {
    setDeletingSchedule(schedule);
  };

  // =========================
  // TUTUP DELETE
  // =========================

  const closeDelete = () => {
    if (deleting) return;

    setDeletingSchedule(null);
  };

  // =========================
  // HAPUS JADWAL
  // =========================

  const handleDelete = async () => {
    if (!deletingSchedule) return;

    try {
      setDeleting(true);

      const response = await fetch(
        `/api/admin/schedules?adminId=${user.id}&id=${deletingSchedule.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Gagal menghapus jadwal."
        );
        return;
      }

      alert(
        data.message ||
          "Jadwal berhasil dihapus."
      );

      closeDelete();

      await getSchedules();
    } catch (error) {
      console.error(
        "DELETE SCHEDULE ERROR:",
        error
      );

      alert(
        "Terjadi kesalahan saat menghapus jadwal."
      );
    } finally {
      setDeleting(false);
    }
  };

  // =========================
  // KELOMPOKKAN JADWAL
  // =========================

  const schedulesByDay = DAYS.map((hari) => ({
    hari,
    data: schedules.filter(
      (schedule) => schedule.hari === hari
    ),
  }));

  // =========================
  // STATISTIK
  // =========================

  const totalSchedules = schedules.length;

  const totalStudentsWithSchedule =
    new Set(
      schedules.map(
        (schedule) => schedule.userId
      )
    ).size;

  const totalStudents = students.length;

  // =========================
  // LOADING
  // =========================

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-slate-600">
          Memuat halaman jadwal...
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
                Manajemen Jadwal PKL
              </h1>

              <p className="text-sm sm:text-base text-slate-500 mt-2">
                Mengatur jadwal masuk dan pulang siswa PKL
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

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 mb-6">

          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-slate-500">
              Total Jadwal
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2">
              {totalSchedules}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-slate-500">
              Siswa Memiliki Jadwal
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2">
              {totalStudentsWithSchedule}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 col-span-2 lg:col-span-1">
            <p className="text-xs sm:text-sm text-slate-500">
              Total Siswa
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">
              {totalStudents}
            </h2>
          </div>

        </div>

        {/* =========================
            FORM TAMBAH / EDIT
        ========================= */}

        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6 lg:p-8 mb-6">

            <div className="flex items-start justify-between gap-4 mb-6">

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                  {editingSchedule
                    ? "✏️ Edit Jadwal"
                    : "➕ Tambah Jadwal"}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {editingSchedule
                    ? "Ubah jadwal PKL siswa"
                    : "Tambahkan jadwal PKL untuk siswa"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold"
              >
                ✕
              </button>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* SISWA */}

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Siswa
                </label>

                {editingSchedule ? (
                  <div className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-100 text-slate-700">
                    <p className="font-semibold">
                      {editingSchedule.user?.nama ||
                        "-"}
                    </p>

                    <p className="text-sm text-slate-500 mt-1">
                      {editingSchedule.user?.kelas ||
                        "-"}
                      {" • "}
                      {editingSchedule.user?.tempatPkl ||
                        "-"}
                    </p>
                  </div>
                ) : (
                  <select
                    value={selectedUserId}
                    onChange={(e) =>
                      setSelectedUserId(
                        e.target.value
                      )
                    }
                    disabled={loadingStudents}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100"
                  >
                    <option value="">
                      {loadingStudents
                        ? "Memuat siswa..."
                        : "Pilih siswa"}
                    </option>

                    {students
                      .filter(
                        (student) =>
                          student.aktif !== false
                      )
                      .map((student) => (
                        <option
                          key={student.id}
                          value={student.id}
                        >
                          {student.nama}
                          {student.kelas
                            ? ` — ${student.kelas}`
                            : ""}
                          {student.nis
                            ? ` — NIS ${student.nis}`
                            : ""}
                        </option>
                      ))}
                  </select>
                )}
              </div>

              {/* HARI */}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Hari
                </label>

                <select
                  value={selectedHari}
                  onChange={(e) =>
                    setSelectedHari(
                      e.target.value
                    )
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {DAYS.map((hari) => (
                    <option
                      key={hari}
                      value={hari}
                    >
                      {hari}
                    </option>
                  ))}
                </select>
              </div>

              {/* JAM MASUK */}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Jam Masuk
                </label>

                <input
                  type="time"
                  value={jamMasuk}
                  onChange={(e) =>
                    setJamMasuk(
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
                  type="time"
                  value={jamPulang}
                  onChange={(e) =>
                    setJamPulang(
                      e.target.value
                    )
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

            </div>

            {/* TOMBOL */}

            <div className="flex flex-col sm:flex-row gap-3 mt-6">

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="flex-1 py-3 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={
                  saving ||
                  !selectedUserId ||
                  !jamMasuk ||
                  !jamPulang
                }
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50"
              >
                {saving
                  ? "Menyimpan..."
                  : editingSchedule
                  ? "💾 Simpan Perubahan"
                  : "➕ Tambah Jadwal"}
              </button>

            </div>

          </div>
        )}

        {/* =========================
            DATA JADWAL
        ========================= */}

        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                Data Jadwal Siswa
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Jadwal masuk dan pulang siswa PKL
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">

              <button
                onClick={getSchedules}
                disabled={loading}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-semibold transition"
              >
                {loading
                  ? "Memuat..."
                  : "↻ Refresh"}
              </button>

              <button
                onClick={openAdd}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-semibold transition"
              >
                + Tambah Jadwal
              </button>

            </div>

          </div>

          {/* LOADING */}

          {loading ? (
            <div className="py-12 text-center">

              <div className="animate-spin w-9 h-9 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />

              <p className="text-slate-500">
                Memuat data jadwal...
              </p>

            </div>
          ) : schedules.length === 0 ? (

            /* EMPTY */

            <div className="py-12 text-center">

              <div className="text-5xl mb-4">
                🗓️
              </div>

              <p className="font-semibold text-slate-700">
                Belum ada jadwal
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Jadwal siswa dapat ditambahkan melalui tombol Tambah Jadwal.
              </p>

              <button
                onClick={openAdd}
                className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition"
              >
                + Tambah Jadwal
              </button>

            </div>
          ) : (

            /* TABLE */

            <div className="overflow-x-auto rounded-xl border">

              <table className="w-full min-w-[1000px] border-collapse">

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
                      Hari
                    </th>

                    <th className="border-b p-3 text-left text-sm">
                      Jam Masuk
                    </th>

                    <th className="border-b p-3 text-left text-sm">
                      Jam Pulang
                    </th>

                    <th className="border-b p-3 text-left text-sm">
                      Aksi
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {schedules.map(
                    (schedule) => (
                      <tr
                        key={schedule.id}
                        className="hover:bg-slate-50 transition"
                      >

                        <td className="border-b p-3">
                          <p className="font-semibold text-slate-800">
                            {schedule.user?.nama ||
                              "-"}
                          </p>

                          {schedule.user?.nis && (
                            <p className="text-xs text-slate-400 mt-1">
                              NIS:{" "}
                              {
                                schedule.user
                                  .nis
                              }
                            </p>
                          )}
                        </td>

                        <td className="border-b p-3">
                          {schedule.user?.kelas ||
                            "-"}
                        </td>

                        <td className="border-b p-3">
                          {schedule.user
                            ?.tempatPkl || "-"}
                        </td>

                        <td className="border-b p-3">
                          <span className="inline-flex bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                            {schedule.hari}
                          </span>
                        </td>

                        <td className="border-b p-3 whitespace-nowrap">
                          <span className="font-semibold text-green-600">
                            {formatTime(
                              schedule.jamMasuk
                            )}
                          </span>
                        </td>

                        <td className="border-b p-3 whitespace-nowrap">
                          <span className="font-semibold text-red-500">
                            {formatTime(
                              schedule.jamPulang
                            )}
                          </span>
                        </td>

                        <td className="border-b p-3">

                          <div className="flex flex-col gap-2 min-w-[110px]">

                            <button
                              type="button"
                              onClick={() =>
                                openEdit(
                                  schedule
                                )
                              }
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition"
                            >
                              ✏️ Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openDelete(
                                  schedule
                                )
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

        {/* =========================
            RINGKASAN PER HARI
        ========================= */}

        {schedules.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8 mt-6">

            <div className="mb-6">

              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                Ringkasan Jadwal
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Jumlah siswa berdasarkan hari PKL
              </p>

            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">

              {schedulesByDay.map(
                ({ hari, data }) => (
                  <div
                    key={hari}
                    className="border border-slate-200 rounded-xl p-4 text-center bg-slate-50"
                  >

                    <p className="text-sm font-semibold text-slate-700">
                      {hari}
                    </p>

                    <p className="text-2xl font-bold text-blue-600 mt-2">
                      {data.length}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      siswa
                    </p>

                  </div>
                )
              )}

            </div>

          </div>
        )}

      </div>

      {/* =====================================================
          MODAL DELETE
      ===================================================== */}

      {deletingSchedule && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">

            <div className="p-5 sm:p-6">

              <div className="text-center">

                <div className="text-5xl mb-3">
                  ⚠️
                </div>

                <h2 className="text-xl font-bold text-slate-800">
                  Hapus Jadwal?
                </h2>

                <p className="text-sm text-slate-500 mt-2">
                  Kamu akan menghapus jadwal:
                </p>

                <p className="font-bold text-slate-800 mt-2">
                  {deletingSchedule.user
                    ?.nama || "-"}
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  {deletingSchedule.hari}
                  {" • "}
                  {formatTime(
                    deletingSchedule.jamMasuk
                  )}
                  {" - "}
                  {formatTime(
                    deletingSchedule.jamPulang
                  )}
                </p>

              </div>

              <div className="mt-5 bg-red-50 border border-red-200 rounded-xl p-4">

                <p className="text-sm text-red-700">
                  Jadwal ini akan dihapus dari sistem dan tidak dapat digunakan lagi untuk menentukan jadwal presensi siswa.
                </p>

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
                  disabled={deleting}
                  className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold disabled:opacity-50"
                >
                  {deleting
                    ? "Menghapus..."
                    : "🗑️ Hapus Jadwal"}
                </button>

              </div>

            </div>

          </div>

        </div>
      )}
    </main>
  );
}