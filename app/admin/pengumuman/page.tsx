"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Announcement {
  id: number;
  judul: string;
  isi: string;
  createdAt: string;
  updatedAt: string;
}

interface StoredUser {
  id: number;
  nama: string;
  username: string;
  role: string;
}

export default function PengumumanAdminPage() {
  const router = useRouter();

  const [user, setUser] = useState<StoredUser | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [deleteTarget, setDeleteTarget] =
    useState<Announcement | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.replace("/login");
      return;
    }

    try {
      const parsedUser: StoredUser = JSON.parse(storedUser);

      if (parsedUser.role !== "ADMIN") {
        router.replace("/dashboard");
        return;
      }

      setUser(parsedUser);
      getAnnouncements(parsedUser.id);
    } catch (error) {
      console.error("USER DATA ERROR:", error);
      localStorage.removeItem("user");
      router.replace("/login");
    }
  }, [router]);

  const getAnnouncements = async (userId: number) => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch(
        `/api/admin/announcements?userId=${userId}`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal mengambil data pengumuman."
        );
      }

      setAnnouncements(result.data || []);
    } catch (error) {
      console.error("GET ANNOUNCEMENTS ERROR:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data pengumuman."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setJudul("");
    setIsi("");
    setEditingId(null);
    setShowForm(false);
    setMessage("");
    setErrorMessage("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) return;

    const cleanJudul = judul.trim();
    const cleanIsi = isi.trim();

    if (!cleanJudul) {
      setErrorMessage("Judul pengumuman wajib diisi.");
      return;
    }

    if (cleanJudul.length < 3) {
      setErrorMessage(
        "Judul pengumuman minimal 3 karakter."
      );
      return;
    }

    if (cleanJudul.length > 200) {
      setErrorMessage(
        "Judul pengumuman maksimal 200 karakter."
      );
      return;
    }

    if (!cleanIsi) {
      setErrorMessage("Isi pengumuman wajib diisi.");
      return;
    }

    if (cleanIsi.length < 5) {
      setErrorMessage(
        "Isi pengumuman minimal 5 karakter."
      );
      return;
    }

    if (cleanIsi.length > 5000) {
      setErrorMessage(
        "Isi pengumuman maksimal 5000 karakter."
      );
      return;
    }

    try {
      setProcessing(true);
      setMessage("");
      setErrorMessage("");

      const isEditing = editingId !== null;

      const response = await fetch(
        "/api/admin/announcements",
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            isEditing
              ? {
                  id: editingId,
                  userId: user.id,
                  judul: cleanJudul,
                  isi: cleanIsi,
                }
              : {
                  userId: user.id,
                  judul: cleanJudul,
                  isi: cleanIsi,
                }
          ),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            (isEditing
              ? "Gagal memperbarui pengumuman."
              : "Gagal membuat pengumuman.")
        );
      }

      setMessage(
        result.message ||
          (isEditing
            ? "Pengumuman berhasil diperbarui."
            : "Pengumuman berhasil dibuat.")
      );

      setJudul("");
      setIsi("");
      setEditingId(null);
      setShowForm(false);

      await getAnnouncements(user.id);
    } catch (error) {
      console.error("SAVE ANNOUNCEMENT ERROR:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan."
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setJudul(announcement.judul);
    setIsi(announcement.isi);
    setShowForm(true);
    setMessage("");
    setErrorMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async () => {
    if (!user || !deleteTarget) return;

    try {
      setProcessing(true);
      setMessage("");
      setErrorMessage("");

      const response = await fetch(
        `/api/admin/announcements?id=${deleteTarget.id}&userId=${user.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Gagal menghapus pengumuman."
        );
      }

      setMessage(
        result.message ||
          "Pengumuman berhasil dihapus."
      );

      setDeleteTarget(null);

      await getAnnouncements(user.id);
    } catch (error) {
      console.error("DELETE ANNOUNCEMENT ERROR:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Gagal menghapus pengumuman."
      );
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-sm text-slate-500">
          Memuat halaman...
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                ADMIN PANEL
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-800 sm:text-3xl">
                Pengumuman PKL
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Kelola informasi dan pengumuman yang akan
                dilihat oleh siswa.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (showForm) {
                  resetForm();
                } else {
                  setShowForm(true);
                  setMessage("");
                  setErrorMessage("");
                }
              }}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
            >
              {showForm
                ? "Tutup Form"
                : "+ Tambah Pengumuman"}
            </button>
          </div>
        </div>

        {/* MESSAGE */}
        {message && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <div className="flex items-start gap-2">
              <span>✓</span>
              <span>{message}</span>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="flex items-start gap-2">
              <span>!</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* FORM */}
        {showForm && (
          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-800">
                {editingId !== null
                  ? "Edit Pengumuman"
                  : "Tambah Pengumuman"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {editingId !== null
                  ? "Perbarui informasi pengumuman yang sudah dibuat."
                  : "Buat informasi baru yang akan ditampilkan kepada siswa."}
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* JUDUL */}
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="judul"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Judul Pengumuman
                  </label>

                  <span className="text-xs text-slate-400">
                    {judul.length}/200
                  </span>
                </div>

                <input
                  id="judul"
                  type="text"
                  value={judul}
                  onChange={(e) =>
                    setJudul(e.target.value)
                  }
                  placeholder="Contoh: Jadwal Monitoring PKL"
                  maxLength={200}
                  disabled={processing}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>

              {/* ISI */}
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="isi"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Isi Pengumuman
                  </label>

                  <span className="text-xs text-slate-400">
                    {isi.length}/5000
                  </span>
                </div>

                <textarea
                  id="isi"
                  value={isi}
                  onChange={(e) =>
                    setIsi(e.target.value)
                  }
                  placeholder="Tulis isi pengumuman di sini..."
                  maxLength={5000}
                  rows={7}
                  disabled={processing}
                  className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>

              {/* BUTTON */}
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={processing}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={processing}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {processing
                    ? "Menyimpan..."
                    : editingId !== null
                    ? "Simpan Perubahan"
                    : "Publikasikan Pengumuman"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* STAT */}
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Total Pengumuman
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-800">
                  {announcements.length}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                📢
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Pengumuman Terbaru
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {announcements.length > 0
                    ? formatDate(
                        announcements[0].createdAt
                      )
                    : "Belum ada"}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-2xl">
                🕒
              </div>
            </div>
          </div>
        </section>

        {/* LIST */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <h2 className="text-lg font-bold text-slate-800">
              Daftar Pengumuman
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Semua pengumuman yang sudah dibuat oleh admin.
            </p>
          </div>

          {loading ? (
            <div className="px-5 py-12 text-center sm:px-6">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

              <p className="text-sm text-slate-500">
                Memuat pengumuman...
              </p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="px-5 py-14 text-center sm:px-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">
                📢
              </div>

              <h3 className="text-base font-semibold text-slate-700">
                Belum ada pengumuman
              </h3>

              <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                Belum ada pengumuman yang dibuat.
                Klik tombol &quot;Tambah Pengumuman&quot;
                untuk membuat informasi baru.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {announcements.map((announcement) => (
                <article
                  key={announcement.id}
                  className="p-5 transition hover:bg-slate-50 sm:p-6"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                          Pengumuman
                        </span>

                        <span className="text-xs text-slate-400">
                          {formatDateTime(
                            announcement.createdAt
                          )}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-800">
                        {announcement.judul}
                      </h3>

                      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                        {announcement.isi}
                      </p>

                      {announcement.updatedAt !==
                        announcement.createdAt && (
                        <p className="mt-3 text-xs text-slate-400">
                          Terakhir diperbarui:{" "}
                          {formatDateTime(
                            announcement.updatedAt
                          )}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 gap-2 lg:pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          handleEdit(announcement)
                        }
                        disabled={processing}
                        className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget(announcement)
                        }
                        disabled={processing}
                        className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* DELETE MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-2xl">
              ⚠️
            </div>

            <h2 className="text-lg font-bold text-slate-800">
              Hapus Pengumuman?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Pengumuman berikut akan dihapus:
            </p>

            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-800">
                {deleteTarget.judul}
              </p>

              <p className="mt-2 line-clamp-3 text-sm text-slate-500">
                {deleteTarget.isi}
              </p>
            </div>

            <p className="mt-4 text-sm text-red-600">
              Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setDeleteTarget(null)
                }
                disabled={processing}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={processing}
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processing
                  ? "Menghapus..."
                  : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}