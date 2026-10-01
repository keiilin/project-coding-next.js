"use client";

import { FormEvent, useEffect, useState } from "react";
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

type Journal = {
  id: number;
  tanggal: string;
  kegiatan: string;
  kendala: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function JurnalPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [journals, setJournals] = useState<Journal[]>([]);

  const [kegiatan, setKegiatan] = useState("");
  const [kendala, setKendala] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [selectedJournal, setSelectedJournal] =
    useState<Journal | null>(null);

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
      getJournals(userData.id);
    } catch (error) {
      console.error(error);
      router.push("/login");
    }
  }, [router]);

  const getJournals = async (userId: number) => {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/journal?userId=${userId}`
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Gagal mengambil data jurnal."
        );
        return;
      }

      setJournals(data.data || []);
    } catch (error) {
      console.error(
        "GET JOURNAL ERROR:",
        error
      );

      alert(
        "Terjadi kesalahan saat mengambil data jurnal."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!user) return;

    if (!kegiatan.trim()) {
      alert("Kegiatan PKL wajib diisi.");
      return;
    }

    if (kegiatan.trim().length < 5) {
      alert(
        "Kegiatan PKL minimal 5 karakter."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "/api/journal",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            kegiatan: kegiatan.trim(),
            kendala: kendala.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Gagal menambahkan jurnal."
        );
        return;
      }

      alert(
        "Jurnal PKL berhasil ditambahkan! ✅"
      );

      setKegiatan("");
      setKendala("");

      await getJournals(user.id);
    } catch (error) {
      console.error(
        "CREATE JOURNAL ERROR:",
        error
      );

      alert(
        "Terjadi kesalahan saat menyimpan jurnal."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    journalId: number
  ) => {
    if (!user) return;

    const yakin = window.confirm(
      "Apakah kamu yakin ingin menghapus jurnal ini?"
    );

    if (!yakin) return;

    try {
      setDeletingId(journalId);

      const response = await fetch(
        `/api/journal?userId=${user.id}&id=${journalId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Gagal menghapus jurnal."
        );
        return;
      }

      alert("Jurnal berhasil dihapus. 🗑️");

      setSelectedJournal(null);

      await getJournals(user.id);
    } catch (error) {
      console.error(
        "DELETE JOURNAL ERROR:",
        error
      );

      alert(
        "Terjadi kesalahan saat menghapus jurnal."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatTanggal = (
    tanggal: string
  ) => {
    return new Date(
      tanggal
    ).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTanggalSingkat = (
    tanggal: string
  ) => {
    return new Date(
      tanggal
    ).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />

          <p className="font-semibold text-slate-700">
            Memuat jurnal PKL...
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
              Jurnal PKL
            </h1>

            <p className="text-xs text-slate-500">
              Catatan kegiatan praktik kerja lapangan
            </p>
          </div>

          <button
            type="button"
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
        <section className="mb-6 rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white shadow-sm md:p-8">

          <p className="text-sm text-purple-100">
            Jurnal Kegiatan PKL
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

        {/* FORM TAMBAH JURNAL */}
        <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm md:p-6">

          <div className="mb-5">

            <h2 className="text-lg font-bold text-slate-800">
              ✏️ Tambah Jurnal
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Catat kegiatan yang kamu lakukan selama PKL hari ini.
            </p>

          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* TANGGAL */}
            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                📅 Tanggal
              </label>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
                {formatTanggal(
                  new Date().toISOString()
                )}
              </div>

              <p className="mt-1 text-xs text-slate-400">
                Tanggal jurnal menggunakan tanggal hari ini.
              </p>

            </div>

            {/* KEGIATAN */}
            <div>

              <label
                htmlFor="kegiatan"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                📝 Kegiatan PKL
              </label>

              <textarea
                id="kegiatan"
                value={kegiatan}
                onChange={(e) =>
                  setKegiatan(e.target.value)
                }
                placeholder="Contoh: Membuat desain tampilan halaman dashboard menggunakan Figma..."
                maxLength={2000}
                rows={6}
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />

              <div className="mt-1 flex justify-end">
                <span className="text-xs text-slate-400">
                  {kegiatan.length}/2000
                </span>
              </div>

            </div>

            {/* KENDALA */}
            <div>

              <label
                htmlFor="kendala"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                ⚠️ Kendala
                <span className="ml-1 font-normal text-slate-400">
                  (opsional)
                </span>
              </label>

              <textarea
                id="kendala"
                value={kendala}
                onChange={(e) =>
                  setKendala(e.target.value)
                }
                placeholder="Contoh: Tidak ada kendala..."
                maxLength={2000}
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />

              <div className="mt-1 flex justify-end">
                <span className="text-xs text-slate-400">
                  {kendala.length}/2000
                </span>
              </div>

            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={
                saving ||
                !kegiatan.trim()
              }
              className="w-full rounded-xl bg-purple-600 py-3.5 font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Menyimpan..."
                : "➕ Simpan Jurnal"}
            </button>

          </form>

        </section>

        {/* STATISTIK JURNAL */}
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">

          <div className="rounded-2xl bg-white p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              Total Jurnal
            </p>

            <p className="mt-2 text-3xl font-bold text-purple-600">
              {journals.length}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Kegiatan yang sudah dicatat
            </p>

          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              Jurnal Terbaru
            </p>

            <p className="mt-2 text-lg font-bold text-blue-600">
              {journals.length > 0
                ? formatTanggalSingkat(
                    journals[0].tanggal
                  )
                : "-"}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Tanggal jurnal terakhir
            </p>

          </div>

        </section>

        {/* DAFTAR JURNAL */}
        <section className="rounded-2xl bg-white shadow-sm">

          <div className="border-b p-5 md:p-6">

            <h2 className="text-lg font-bold text-slate-800">
              📚 Riwayat Jurnal
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Daftar kegiatan PKL yang sudah kamu catat.
            </p>

          </div>

          {journals.length === 0 ? (

            <div className="p-8 text-center md:p-12">

              <div className="mb-4 text-5xl">
                📖
              </div>

              <h3 className="text-lg font-bold text-slate-700">
                Belum Ada Jurnal
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Belum ada kegiatan PKL yang dicatat.
                Gunakan form di atas untuk menambahkan jurnal pertama kamu.
              </p>

            </div>

          ) : (

            <div className="divide-y divide-slate-100">

              {journals.map((journal) => (

                <div
                  key={journal.id}
                  className="p-5 transition hover:bg-slate-50 md:p-6"
                >

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                    <div className="min-w-0 flex-1">

                      <div className="mb-2 flex flex-wrap items-center gap-2">

                        <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                          {formatTanggalSingkat(
                            journal.tanggal
                          )}
                        </span>

                        <span className="text-xs text-slate-400">
                          Jurnal #{journal.id}
                        </span>

                      </div>

                      <h3 className="font-bold text-slate-800">
                        Kegiatan PKL
                      </h3>

                      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                        {journal.kegiatan}
                      </p>

                      {journal.kendala && (
                        <div className="mt-4 rounded-xl bg-amber-50 p-4">

                          <p className="text-xs font-bold text-amber-700">
                            ⚠️ Kendala
                          </p>

                          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-amber-800">
                            {journal.kendala}
                          </p>

                        </div>
                      )}

                    </div>

                    <div className="flex shrink-0 gap-2 sm:flex-col">

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedJournal(
                            journal
                          )
                        }
                        className="flex-1 rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100 sm:flex-none"
                      >
                        👁️ Detail
                      </button>

                      <button
                        type="button"
                        disabled={
                          deletingId ===
                          journal.id
                        }
                        onClick={() =>
                          handleDelete(
                            journal.id
                          )
                        }
                        className="flex-1 rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50 sm:flex-none"
                      >
                        {deletingId ===
                        journal.id
                          ? "..."
                          : "🗑️ Hapus"}
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

        {/* BOTTOM BUTTON */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">

          <button
            type="button"
            onClick={() =>
              router.push("/siswa")
            }
            className="flex-1 rounded-xl border border-slate-200 bg-white py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            ← Kembali ke Dashboard
          </button>

          <button
            type="button"
            onClick={() =>
              router.push("/absensi")
            }
            className="flex-1 rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            📸 Buka Presensi
          </button>

        </div>

      </div>

      {/* MODAL DETAIL */}
      {selectedJournal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() =>
            setSelectedJournal(null)
          }
        >

          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl md:p-6"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="flex items-start justify-between gap-4">

              <div>
                <p className="text-xs font-semibold text-purple-600">
                  Jurnal #{selectedJournal.id}
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-800">
                  Detail Jurnal
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedJournal(null)
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
              >
                ✕
              </button>

            </div>

            <div className="mt-5 space-y-4">

              <div className="rounded-xl bg-purple-50 p-4">

                <p className="text-xs font-bold text-purple-700">
                  📅 Tanggal
                </p>

                <p className="mt-1 text-sm font-semibold text-purple-900">
                  {formatTanggal(
                    selectedJournal.tanggal
                  )}
                </p>

              </div>

              <div>

                <p className="text-sm font-bold text-slate-700">
                  📝 Kegiatan PKL
                </p>

                <div className="mt-2 rounded-xl bg-slate-50 p-4">

                  <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
                    {selectedJournal.kegiatan}
                  </p>

                </div>

              </div>

              <div>

                <p className="text-sm font-bold text-slate-700">
                  ⚠️ Kendala
                </p>

                <div className="mt-2 rounded-xl bg-amber-50 p-4">

                  <p className="whitespace-pre-line text-sm leading-relaxed text-amber-800">
                    {selectedJournal.kendala ||
                      "Tidak ada kendala."}
                  </p>

                </div>

              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                setSelectedJournal(null)
              }
              className="mt-6 w-full rounded-xl bg-slate-800 py-3 font-semibold text-white transition hover:bg-slate-900"
            >
              Tutup
            </button>

          </div>

        </div>
      )}

    </main>
  );
}