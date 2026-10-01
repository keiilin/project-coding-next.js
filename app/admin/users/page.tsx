"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  nama: string;
  username: string;
  role: string;
  nis?: string | null;
  kelas?: string | null;
  jurusan?: string | null;
  tempatPkl?: string | null;
  aktif: boolean;
};

type FormData = {
  nama: string;
  username: string;
  password: string;
  role: string;
  nis: string;
  kelas: string;
  jurusan: string;
  tempatPkl: string;
};

const initialForm: FormData = {
  nama: "",
  username: "",
  password: "",
  role: "SISWA",
  nis: "",
  kelas: "",
  jurusan: "",
  tempatPkl: "",
};

export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<FormData>(initialForm);
  const [changingStatus, setChangingStatus] = useState<number | null>(null);

  // =========================
  // CEK ADMIN
  // =========================

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

      getUsers();
    } catch (error) {
      console.error(error);
      router.push("/login");
    }
  }, [router]);

  // =========================
  // GET USERS
  // =========================

  const getUsers = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/users");

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Gagal mengambil data user");
        return;
      }

      setUsers(data.data || []);
    } catch (error) {
      console.error(error);

      alert("Terjadi kesalahan saat mengambil data user");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // TAMBAH USER
  // =========================

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Gagal menambahkan user");
        return;
      }

      alert("✅ User berhasil ditambahkan!");

      setForm(initialForm);
      setShowForm(false);

      await getUsers();
    } catch (error) {
      console.error(error);

      alert("Terjadi kesalahan saat menambahkan user");
    }
  };

  // =========================
  // EDIT USER
  // =========================

  const handleEdit = (user: User) => {
    setEditingUser(user);

    setForm({
      nama: user.nama || "",
      username: user.username || "",
      password: "",
      role: user.role || "SISWA",
      nis: user.nis || "",
      kelas: user.kelas || "",
      jurusan: user.jurusan || "",
      tempatPkl: user.tempatPkl || "",
    });

    setShowForm(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // UPDATE USER
  // =========================

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingUser) return;

    try {
      const response = await fetch("/api/admin/users/edit", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingUser.id,
          ...form,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Gagal memperbarui user");
        return;
      }

      alert("✅ User berhasil diperbarui!");

      setEditingUser(null);
      setForm(initialForm);

      await getUsers();
    } catch (error) {
      console.error(error);

      alert("Terjadi kesalahan saat memperbarui user");
    }
  };

  // =========================
  // UBAH STATUS USER
  // =========================

  const handleStatusChange = async (user: User) => {
    const newStatus = !user.aktif;

    const actionText = newStatus ? "mengaktifkan" : "menonaktifkan";

    const yakin = confirm(
      `Yakin ingin ${actionText} akun "${user.nama}"?`
    );

    if (!yakin) return;

    try {
      setChangingStatus(user.id);

      const response = await fetch("/api/admin/users/status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user.id,
          aktif: newStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Gagal mengubah status akun");
        return;
      }

      alert(
        newStatus
          ? "✅ Akun berhasil diaktifkan!"
          : "🔒 Akun berhasil dinonaktifkan!"
      );

      await getUsers();
    } catch (error) {
      console.error(error);

      alert("Terjadi kesalahan saat mengubah status akun");
    } finally {
      setChangingStatus(null);
    }
  };

  // =========================
  // BATAL
  // =========================

  const cancelForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setForm(initialForm);
  };

  // =========================
  // ROLE STYLE
  // =========================

  const getRoleStyle = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-700";

      case "PEMBIMBING":
        return "bg-purple-100 text-purple-700";

      case "KETUA_JURUSAN":
        return "bg-orange-100 text-orange-700";

      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  // =========================
  // ROLE LABEL
  // =========================

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Admin";

      case "PEMBIMBING":
        return "Pembimbing";

      case "KETUA_JURUSAN":
        return "Ketua Jurusan";

      default:
        return "Siswa";
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* ================= HEADER ================= */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">
              Manajemen User
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Kelola seluruh akun pengguna sistem PKL.
            </p>
          </div>

          {!editingUser && (
            <button
              onClick={() => {
                setShowForm(!showForm);
                setForm(initialForm);
              }}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              {showForm ? "✕ Tutup Form" : "+ Tambah User"}
            </button>
          )}
        </div>

        {/* ================= FORM TAMBAH ================= */}

        {showForm && !editingUser && (
          <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm md:p-6">
            <h2 className="mb-5 text-lg font-bold text-slate-800">
              Tambah User Baru
            </h2>

            <form
              onSubmit={handleAdd}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Nama Lengkap
                </label>

                <input
                  name="nama"
                  value={form.nama}
                  onChange={handleChange}
                  placeholder="Masukkan nama lengkap"
                  required
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Username
                </label>

                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Masukkan username"
                  required
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Password
                </label>

                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Masukkan password"
                  required
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Role
                </label>

                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-blue-500"
                >
                  <option value="SISWA">Siswa</option>
                  <option value="PEMBIMBING">Pembimbing</option>
                  <option value="KETUA_JURUSAN">
                    Ketua Jurusan
                  </option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  NIS
                </label>

                <input
                  name="nis"
                  value={form.nis}
                  onChange={handleChange}
                  placeholder="Masukkan NIS"
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Kelas
                </label>

                <input
                  name="kelas"
                  value={form.kelas}
                  onChange={handleChange}
                  placeholder="Contoh: XI RPL 2"
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Jurusan
                </label>

                <input
                  name="jurusan"
                  value={form.jurusan}
                  onChange={handleChange}
                  placeholder="Contoh: Rekayasa Perangkat Lunak"
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Tempat PKL
                </label>

                <input
                  name="tempatPkl"
                  value={form.tempatPkl}
                  onChange={handleChange}
                  placeholder="Nama tempat PKL"
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700"
                >
                  💾 Simpan User
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= FORM EDIT ================= */}

        {editingUser && (
          <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm md:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Edit User
                </h2>

                <p className="text-sm text-slate-500">
                  Mengubah data{" "}
                  <span className="font-semibold">
                    {editingUser.nama}
                  </span>
                </p>
              </div>

              <button
                onClick={cancelForm}
                className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleUpdate}
              className="grid grid-cols-1 gap-4 md:grid-cols-2"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Nama Lengkap
                </label>

                <input
                  name="nama"
                  value={form.nama}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Username
                </label>

                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Password Baru
                </label>

                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Kosongkan jika tidak diubah"
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Role
                </label>

                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 outline-none focus:border-blue-500"
                >
                  <option value="SISWA">Siswa</option>
                  <option value="PEMBIMBING">Pembimbing</option>
                  <option value="KETUA_JURUSAN">
                    Ketua Jurusan
                  </option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  NIS
                </label>

                <input
                  name="nis"
                  value={form.nis}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Kelas
                </label>

                <input
                  name="kelas"
                  value={form.kelas}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Jurusan
                </label>

                <input
                  name="jurusan"
                  value={form.jurusan}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Tempat PKL
                </label>

                <input
                  name="tempatPkl"
                  value={form.tempatPkl}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row md:col-span-2">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  💾 Simpan Perubahan
                </button>

                <button
                  type="button"
                  onClick={cancelForm}
                  className="rounded-xl bg-slate-200 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-300"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= DAFTAR USER ================= */}

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-800">
                Daftar User
              </h2>

              <p className="text-sm text-slate-500">
                Total {users.length} user
              </p>
            </div>

            <button
              onClick={getUsers}
              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
            >
              🔄 Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-500">
              Memuat data user...
            </div>
          ) : users.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mb-3 text-4xl">
                👤
              </div>

              <p className="font-semibold text-slate-700">
                Belum ada user
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Tambahkan user menggunakan tombol di atas.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1250px] text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      No
                    </th>

                    <th className="px-4 py-3 text-left">
                      Nama
                    </th>

                    <th className="px-4 py-3 text-left">
                      Username
                    </th>

                    <th className="px-4 py-3 text-left">
                      Role
                    </th>

                    <th className="px-4 py-3 text-left">
                      Status
                    </th>

                    <th className="px-4 py-3 text-left">
                      NIS
                    </th>

                    <th className="px-4 py-3 text-left">
                      Kelas
                    </th>

                    <th className="px-4 py-3 text-left">
                      Jurusan
                    </th>

                    <th className="px-4 py-3 text-left">
                      Tempat PKL
                    </th>

                    <th className="px-4 py-3 text-left">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user, index) => (
                    <tr
                      key={user.id}
                      className="border-t transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">
                        {index + 1}
                      </td>

                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {user.nama}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {user.username}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getRoleStyle(
                            user.role
                          )}`}
                        >
                          {getRoleLabel(user.role)}
                        </span>
                      </td>

                      {/* ================= STATUS ================= */}

                      <td className="px-4 py-3">
                        {user.aktif ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                            🟢 Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                            🔴 Nonaktif
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {user.nis || "-"}
                      </td>

                      <td className="px-4 py-3">
                        {user.kelas || "-"}
                      </td>

                      <td className="px-4 py-3">
                        {user.jurusan || "-"}
                      </td>

                      <td className="px-4 py-3">
                        {user.tempatPkl || "-"}
                      </td>

                      {/* ================= AKSI ================= */}

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="rounded-lg bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-200"
                          >
                            ✏️ Edit
                          </button>

                          {user.aktif ? (
                            <button
                              onClick={() =>
                                handleStatusChange(user)
                              }
                              disabled={changingStatus === user.id}
                              className="rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {changingStatus === user.id
                                ? "⏳ Memproses..."
                                : "🔒 Nonaktifkan"}
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleStatusChange(user)
                              }
                              disabled={changingStatus === user.id}
                              className="rounded-lg bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {changingStatus === user.id
                                ? "⏳ Memproses..."
                                : "🟢 Aktifkan"}
                            </button>
                          )}
                        </div>
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