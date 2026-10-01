"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Journal {
  id: number;
  tanggal: string;
  kegiatan: string;
  kendala: string | null;
  createdAt: string;
  updatedAt?: string;
}

export default function JurnalPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [journals, setJournals] = useState<Journal[]>([]);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [kegiatan, setKegiatan] = useState("");
  const [kendala, setKendala] = useState("");

  const [showForm, setShowForm] = useState(false);

  // ==============================
  // STATE EDIT
  // ==============================
  const [editingId, setEditingId] = useState<number | null>(null);

  // ==============================
  // CEK LOGIN
  // ==============================
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const userData = JSON.parse(storedUser);

      if (userData.role !== "SISWA") {
        router.push("/login");
        return;
      }

      setUser(userData);
    } catch (error) {
      console.error(error);
      localStorage.removeItem("user");
      router.push("/login");
    }
  }, [router]);

  // ==============================
  // AMBIL DATA JURNAL
  // ==============================
  const getJournals = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const response = await fetch(
        `/api/journal?userId=${user.id}`
      );

      const data = await response.json();

      if (response.ok) {
        setJournals(data.data || []);
      } else {
        alert(data.message || "Gagal mengambil data jurnal");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat mengambil jurnal");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getJournals();
    }
  }, [user]);

  // ==============================
  // RESET FORM
  // ==============================
  const resetForm = () => {
    setKegiatan("");
    setKendala("");
    setEditingId(null);
    setShowForm(false);
  };

  // ==============================
  // TAMBAH / EDIT JURNAL
  // ==============================
  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!kegiatan.trim()) {
      alert("Kegiatan wajib diisi");
      return;
    }

    if (kegiatan.trim().length < 5) {
      alert("Kegiatan minimal 5 karakter");
      return;
    }

    if (kegiatan.trim().length > 2000) {
      alert("Kegiatan maksimal 2000 karakter");
      return;
    }

    if (kendala.trim().length > 2000) {
      alert("Kendala maksimal 2000 karakter");
      return;
    }

    if (!user) return;

    try {
      setProcessing(true);

      const isEditing = editingId !== null;

      const response = await fetch(
        "/api/journal",
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
                  kegiatan: kegiatan.trim(),
                  kendala: kendala.trim(),
                }
              : {
                  userId: user.id,
                  kegiatan: kegiatan.trim(),
                  kendala: kendala.trim(),
                }
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            (isEditing
              ? "Gagal mengubah jurnal"
              : "Gagal menyimpan jurnal")
        );
        return;
      }

      alert(
        data.message ||
          (isEditing
            ? "Jurnal berhasil diubah"
            : "Jurnal berhasil disimpan")
      );

      resetForm();

      await getJournals();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan");
    } finally {
      setProcessing(false);
    }
  };

  // ==============================
  // MULAI EDIT
  // ==============================
  const handleEdit = (journal: Journal) => {
    setEditingId(journal.id);
    setKegiatan(journal.kegiatan);
    setKendala(journal.kendala || "");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==============================
  // HAPUS JURNAL
  // ==============================
  const handleDelete = async (id: number) => {
    const confirmDelete = confirm(
      "Apakah kamu yakin ingin menghapus jurnal ini?"
    );

    if (!confirmDelete) return;

    if (!user) return;

    try {
      setProcessing(true);

      const response = await fetch(
        `/api/journal?id=${id}&userId=${user.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Gagal menghapus jurnal"
        );
        return;
      }

      alert(
        data.message ||
          "Jurnal berhasil dihapus"
      );

      await getJournals();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan");
    } finally {
      setProcessing(false);
    }
  };

  // ==============================
  // FORMAT TANGGAL
  // ==============================
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

  // ==============================
  // LOADING
  // ==============================
  if (loading && !user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Memuat...
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6 md:p-8 lg:p-10">
      <div className="max-w-5xl mx-auto">

        {/* ============================== */}
        {/* HEADER */}
        {/* ============================== */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">
              Aktivitas Harian
            </p>

            <h1 className="text-2xl sm:text-3xl font-bold mt-1">
              Jurnal PKL
            </h1>

            <p className="text-sm text-gray-500 mt-2">
              Catat kegiatan dan kendala selama PKL.
            </p>
          </div>

          <button
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
              }
            }}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold transition active:scale-95"
          >
            {showForm
              ? "Tutup Form"
              : "+ Tambah Jurnal"}
          </button>
        </div>

        {/* ============================== */}
        {/* FORM TAMBAH / EDIT JURNAL */}
        {/* ============================== */}
        {showForm && (
          <div className="bg-white border rounded-2xl shadow-sm p-5 sm:p-6 mb-6">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
              <div>
                <h2 className="text-lg sm:text-xl font-bold">
                  {editingId
                    ? "Edit Jurnal"
                    : "Tambah Jurnal Hari Ini"}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {editingId
                    ? "Perbarui catatan kegiatan PKL kamu."
                    : "Catat kegiatan PKL yang kamu lakukan hari ini."}
                </p>
              </div>

              {editingId && (
                <span className="w-fit bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-2 rounded-lg">
                  Mode Edit
                </span>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* KEGIATAN */}
              <div>
                <label className="block font-medium mb-2">
                  Kegiatan
                </label>

                <textarea
                  value={kegiatan}
                  onChange={(e) =>
                    setKegiatan(e.target.value)
                  }
                  placeholder="Contoh: Membantu membuat desain halaman dashboard..."
                  maxLength={2000}
                  className="w-full min-h-32 border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />

                <div className="flex justify-between mt-2">
                  <p className="text-xs text-gray-400">
                    Jelaskan kegiatan yang kamu lakukan hari ini.
                  </p>

                  <p className="text-xs text-gray-400">
                    {kegiatan.length}/2000
                  </p>
                </div>
              </div>

              {/* KENDALA */}
              <div>
                <label className="block font-medium mb-2">
                  Kendala
                  <span className="text-gray-400 font-normal">
                    {" "} (Opsional)
                  </span>
                </label>

                <textarea
                  value={kendala}
                  onChange={(e) =>
                    setKendala(e.target.value)
                  }
                  placeholder="Contoh: Mengalami kendala pada koneksi database..."
                  maxLength={2000}
                  className="w-full min-h-28 border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />

                <div className="flex justify-end mt-2">
                  <p className="text-xs text-gray-400">
                    {kendala.length}/2000
                  </p>
                </div>
              </div>

              {/* BUTTON */}
              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={processing}
                  className="w-full sm:w-auto border px-5 py-3 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-semibold transition"
                >
                  {processing
                    ? "Menyimpan..."
                    : editingId
                    ? "Simpan Perubahan"
                    : "Simpan Jurnal"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ============================== */}
        {/* STATISTIK */}
        {/* ============================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

          {/* TOTAL JURNAL */}
          <div className="bg-white border rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Total Jurnal
                </p>

                <h3 className="text-3xl font-bold mt-2">
                  {journals.length}
                </h3>
              </div>

              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                📖
              </div>
            </div>
          </div>

          {/* JURNAL TERAKHIR */}
          <div className="bg-white border rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Jurnal Terakhir
                </p>

                <h3 className="font-bold mt-2">
                  {journals.length > 0
                    ? new Date(
                        journals[0].tanggal
                      ).toLocaleDateString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "-"}
                </h3>
              </div>

              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                📅
              </div>
            </div>
          </div>
        </div>

        {/* ============================== */}
        {/* LIST JURNAL */}
        {/* ============================== */}
        <div className="bg-white border rounded-2xl shadow-sm">

          <div className="p-5 sm:p-6 border-b">
            <h2 className="text-lg sm:text-xl font-bold">
              Riwayat Jurnal
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Semua aktivitas PKL yang telah dicatat.
            </p>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="p-10 text-center text-gray-500">
              Memuat jurnal...
            </div>

          ) : journals.length === 0 ? (

            /* KOSONG */
            <div className="p-10 sm:p-16 text-center">

              <div className="text-5xl mb-4">
                📖
              </div>

              <h3 className="font-bold text-lg">
                Belum Ada Jurnal
              </h3>

              <p className="text-gray-500 text-sm mt-2">
                Mulai catat kegiatan PKL kamu hari ini.
              </p>

              <button
                onClick={() => setShowForm(true)}
                className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl transition"
              >
                Tambah Jurnal Pertama
              </button>
            </div>

          ) : (

            /* LIST */
            <div className="divide-y">

              {journals.map((journal) => (
                <div
                  key={journal.id}
                  className="p-5 sm:p-6"
                >

                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

                    <div className="flex gap-4 flex-1 min-w-0">

                      {/* ICON */}
                      <div className="w-11 h-11 min-w-11 bg-blue-100 rounded-xl flex items-center justify-center">
                        📖
                      </div>

                      <div className="flex-1 min-w-0">

                        {/* TANGGAL */}
                        <p className="font-semibold">
                          {formatDate(
                            journal.tanggal
                          )}
                        </p>

                        {/* KEGIATAN */}
                        <div className="mt-3">
                          <p className="text-xs font-medium text-gray-400 uppercase">
                            Kegiatan
                          </p>

                          <p className="text-gray-700 mt-1 whitespace-pre-line break-words">
                            {journal.kegiatan}
                          </p>
                        </div>

                        {/* KENDALA */}
                        {journal.kendala && (
                          <div className="mt-4 bg-orange-50 border border-orange-100 rounded-xl p-3">

                            <p className="text-xs font-medium text-orange-600">
                              Kendala
                            </p>

                            <p className="text-sm text-gray-700 mt-1 whitespace-pre-line break-words">
                              {journal.kendala}
                            </p>

                          </div>
                        )}

                        {/* TIDAK ADA KENDALA */}
                        {!journal.kendala && (
                          <div className="mt-4 bg-green-50 border border-green-100 rounded-xl p-3">
                            <p className="text-xs text-green-600">
                              ✓ Tidak ada kendala yang dicatat.
                            </p>
                          </div>
                        )}

                        {/* ACTION */}
                        <div className="flex flex-col sm:flex-row gap-2 mt-4">

                          {/* EDIT */}
                          <button
                            onClick={() =>
                              handleEdit(journal)
                            }
                            disabled={processing}
                            className="w-full sm:w-auto bg-blue-50 hover:bg-blue-100 disabled:opacity-50 text-blue-600 px-4 py-2 rounded-lg transition text-sm font-medium"
                          >
                            ✏️ Edit
                          </button>

                          {/* HAPUS */}
                          <button
                            onClick={() =>
                              handleDelete(
                                journal.id
                              )
                            }
                            disabled={processing}
                            className="w-full sm:w-auto text-red-500 hover:bg-red-50 disabled:opacity-50 px-4 py-2 rounded-lg transition text-sm"
                          >
                            🗑️ Hapus
                          </button>

                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            </div>
          )}
        </div>
      </div>
    </main>
  );
}