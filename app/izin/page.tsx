"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  nama: string;
  username: string;
  role: string;
  aktif?: boolean;
};

type LeaveRequest = {
  id: number;
  userId: number;
  tanggal: string;
  status: string;
  alasan: string;
  statusPengajuan: string;
  catatanAdmin: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function IzinPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);

  const [tanggal, setTanggal] = useState("");
  const [status, setStatus] = useState("IZIN");
  const [alasan, setAlasan] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | ""
  >("");

  // =====================================================
  // FORMAT TANGGAL
  // =====================================================
  const formatTanggal = (value: string) => {
    try {
      return new Date(value).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return value;
    }
  };

  const formatTanggalWaktu = (value: string) => {
    try {
      return new Date(value).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return value;
    }
  };

  // =====================================================
  // CEK LOGIN
  // =====================================================
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        router.push("/login");
        return;
      }

      const parsedUser: User = JSON.parse(savedUser);

      if (parsedUser.role !== "SISWA") {
        router.push("/");
        return;
      }

      setUser(parsedUser);
    } catch (error) {
      console.error("USER SESSION ERROR:", error);
      router.push("/login");
    }
  }, [router]);

  // =====================================================
  // LOAD PENGAJUAN
  // =====================================================
  const loadRequests = async () => {
    try {
      setLoading(true);

      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        router.push("/login");
        return;
      }

      const parsedUser: User = JSON.parse(savedUser);

      const response = await fetch(
        `/api/leave?userId=${parsedUser.id}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Gagal mengambil data pengajuan."
        );
      }

      setRequests(data.data || []);
    } catch (error) {
      console.error("LOAD LEAVE ERROR:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data pengajuan."
      );

      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user]);

  // =====================================================
  // SUBMIT PENGAJUAN
  // =====================================================
  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!user) return;

    setMessage("");
    setMessageType("");

    if (!tanggal) {
      setMessage("Tanggal wajib dipilih.");
      setMessageType("error");
      return;
    }

    if (!alasan.trim()) {
      setMessage("Alasan wajib diisi.");
      setMessageType("error");
      return;
    }

    if (alasan.trim().length < 5) {
      setMessage(
        "Alasan terlalu singkat. Silakan jelaskan lebih lengkap."
      );
      setMessageType("error");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          tanggal,
          status,
          alasan: alasan.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Gagal mengirim pengajuan."
        );
      }

      setMessage(
        data.message || "Pengajuan berhasil dikirim."
      );
      setMessageType("success");

      setTanggal("");
      setStatus("IZIN");
      setAlasan("");

      await loadRequests();
    } catch (error) {
      console.error("SUBMIT LEAVE ERROR:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Gagal mengirim pengajuan."
      );

      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // BATALKAN PENGAJUAN
  // =====================================================
  const handleDelete = async (item: LeaveRequest) => {
    if (!user) return;

    const confirmed = window.confirm(
      `Batalkan pengajuan ${item.status.toLowerCase()} untuk tanggal ${formatTanggal(
        item.tanggal
      )}?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(item.id);

      const response = await fetch(
        `/api/leave?id=${item.id}&userId=${user.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Gagal membatalkan pengajuan."
        );
      }

      setMessage(
        data.message || "Pengajuan berhasil dibatalkan."
      );
      setMessageType("success");

      await loadRequests();
    } catch (error) {
      console.error("DELETE LEAVE ERROR:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Gagal membatalkan pengajuan."
      );

      setMessageType("error");
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // STATUS BADGE
  // =====================================================
  const statusBadge = (value: string) => {
    if (value === "MENUNGGU") {
      return (
        <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
          ⏳ Menunggu
        </span>
      );
    }

    if (value === "DITERIMA") {
      return (
        <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          ✓ Diterima
        </span>
      );
    }

    if (value === "DITOLAK") {
      return (
        <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
          ✕ Ditolak
        </span>
      );
    }

    return (
      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
        {value}
      </span>
    );
  };

  // =====================================================
  // TYPE BADGE
  // =====================================================
  const typeBadge = (value: string) => {
    if (value === "SAKIT") {
      return (
        <span className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
          🤒 Sakit
        </span>
      );
    }

    return (
      <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
        📄 Izin
      </span>
    );
  };

  // =====================================================
  // LOADING SESSION
  // =====================================================
  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl bg-white px-8 py-6 text-center shadow-sm">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="text-sm text-slate-500">
            Memuat halaman...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* =================================================
            HEADER
        ================================================= */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/")}
            className="mb-3 text-sm font-medium text-slate-500 transition hover:text-blue-600"
          >
            ← Kembali ke Dashboard
          </button>

          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
            Izin & Sakit
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Ajukan izin atau sakit untuk keperluan PKL.
          </p>
        </div>

        {/* =================================================
            MESSAGE
        ================================================= */}
        {message && (
          <div
            className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
              messageType === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">

          {/* =================================================
              FORM
          ================================================= */}
          <section className="h-fit rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
            <div className="mb-5">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                📝
              </div>

              <h2 className="text-lg font-bold text-slate-800">
                Buat Pengajuan
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Isi data berikut dengan benar sebelum mengirim
                pengajuan.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* TANGGAL */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Tanggal
                </label>

                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  Pilih tanggal kamu tidak dapat mengikuti kegiatan
                  PKL.
                </p>
              </div>

              {/* JENIS */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Jenis Pengajuan
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStatus("IZIN")}
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                      status === "IZIN"
                        ? "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-100"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    📄 Izin
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus("SAKIT")}
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                      status === "SAKIT"
                        ? "border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-100"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    🤒 Sakit
                  </button>
                </div>
              </div>

              {/* ALASAN */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Alasan
                </label>

                <textarea
                  value={alasan}
                  onChange={(e) => setAlasan(e.target.value)}
                  rows={6}
                  placeholder="Jelaskan alasan pengajuan izin atau sakit..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />

                <div className="mt-1 flex justify-between text-xs text-slate-400">
                  <span>Minimal 5 karakter</span>
                  <span>{alasan.length} karakter</span>
                </div>
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Mengirim Pengajuan..."
                  : "Kirim Pengajuan"}
              </button>
            </form>
          </section>

          {/* =================================================
              HISTORY
          ================================================= */}
          <section className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">

            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Riwayat Pengajuan
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Daftar pengajuan izin dan sakit kamu.
                </p>
              </div>

              <button
                onClick={loadRequests}
                disabled={loading}
                className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
              >
                🔄 Refresh
              </button>
            </div>

            {loading ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                <p className="text-sm text-slate-500">
                  Memuat riwayat...
                </p>
              </div>
            ) : requests.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mb-3 text-5xl">📭</div>

                <h3 className="font-semibold text-slate-700">
                  Belum ada pengajuan
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Pengajuan izin atau sakit kamu akan muncul di
                  sini.
                </p>
              </div>
            ) : (
              <div className="space-y-4 p-4 sm:p-6">
                {requests.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 p-4 transition hover:shadow-sm sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          {typeBadge(item.status)}
                          {statusBadge(item.statusPengajuan)}
                        </div>

                        <h3 className="mt-3 font-bold text-slate-800">
                          {formatTanggal(item.tanggal)}
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                          Diajukan{" "}
                          {formatTanggalWaktu(item.createdAt)}
                        </p>
                      </div>

                      {item.statusPengajuan === "MENUNGGU" && (
                        <button
                          onClick={() => handleDelete(item)}
                          disabled={deletingId === item.id}
                          className="rounded-xl bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          {deletingId === item.id
                            ? "Membatalkan..."
                            : "Batalkan"}
                        </button>
                      )}
                    </div>

                    {/* ALASAN */}
                    <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold text-slate-400">
                        Alasan
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                        {item.alasan}
                      </p>
                    </div>

                    {/* CATATAN ADMIN */}
                    {item.catatanAdmin && (
                      <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-xs font-semibold text-slate-400">
                          Catatan Admin
                        </p>

                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                          {item.catatanAdmin}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}