"use client";

import { useEffect, useMemo, useState } from "react";
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
  user: {
    id: number;
    nama: string;
    username: string;
    nis: string | null;
    kelas: string | null;
    jurusan: string | null;
    tempatPkl: string | null;
    aktif: boolean;
  };
};

export default function AdminIzinPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [filter, setFilter] = useState("SEMUA");
  const [search, setSearch] = useState("");

  const [selectedRequest, setSelectedRequest] =
    useState<LeaveRequest | null>(null);

  const [showDetail, setShowDetail] = useState(false);
  const [showReject, setShowReject] = useState(false);

  const [catatanAdmin, setCatatanAdmin] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | ""
  >("");

  // =====================================================
  // FORMAT TANGGAL
  // =====================================================
  const formatTanggal = (tanggal: string) => {
    try {
      return new Date(tanggal).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return tanggal;
    }
  };

  const formatTanggalWaktu = (tanggal: string) => {
    try {
      return new Date(tanggal).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return tanggal;
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

      if (parsedUser.role !== "ADMIN") {
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
  // LOAD DATA
  // =====================================================
  const loadRequests = async () => {
    try {
      setLoading(true);
      setMessage("");

      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        router.push("/login");
        return;
      }

      const parsedUser: User = JSON.parse(savedUser);

      if (parsedUser.role !== "ADMIN") {
        router.push("/");
        return;
      }

      const response = await fetch(
        `/api/admin/leave?adminId=${parsedUser.id}`,
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
  // FILTER DATA
  // =====================================================
  const filteredRequests = useMemo(() => {
    return requests.filter((item) => {
      const matchesStatus =
        filter === "SEMUA" ||
        item.statusPengajuan === filter;

      const keyword = search.trim().toLowerCase();

      if (!keyword) {
        return matchesStatus;
      }

      const matchesSearch =
        item.user.nama.toLowerCase().includes(keyword) ||
        item.user.username.toLowerCase().includes(keyword) ||
        (item.user.nis || "").toLowerCase().includes(keyword) ||
        (item.user.kelas || "").toLowerCase().includes(keyword) ||
        item.status.toLowerCase().includes(keyword) ||
        item.alasan.toLowerCase().includes(keyword);

      return matchesStatus && matchesSearch;
    });
  }, [requests, filter, search]);

  // =====================================================
  // STATISTIK
  // =====================================================
  const totalPengajuan = requests.length;

  const totalMenunggu = requests.filter(
    (item) => item.statusPengajuan === "MENUNGGU"
  ).length;

  const totalDiterima = requests.filter(
    (item) => item.statusPengajuan === "DITERIMA"
  ).length;

  const totalDitolak = requests.filter(
    (item) => item.statusPengajuan === "DITOLAK"
  ).length;

  // =====================================================
  // PROSES KEPUTUSAN
  // =====================================================
  const processRequest = async (
    requestId: number,
    keputusan: "DITERIMA" | "DITOLAK",
    catatan: string
  ) => {
    try {
      if (!user) return;

      setProcessing(true);
      setMessage("");

      const response = await fetch("/api/admin/leave", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminId: user.id,
          id: requestId,
          keputusan,
          catatanAdmin: catatan,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Gagal memproses pengajuan."
        );
      }

      setMessage(data.message || "Pengajuan berhasil diproses.");
      setMessageType("success");

      setSelectedRequest(null);
      setShowDetail(false);
      setShowReject(false);
      setCatatanAdmin("");

      await loadRequests();
    } catch (error) {
      console.error("PROCESS LEAVE ERROR:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Gagal memproses pengajuan."
      );

      setMessageType("error");
    } finally {
      setProcessing(false);
    }
  };

  // =====================================================
  // TERIMA
  // =====================================================
  const handleAccept = async (item: LeaveRequest) => {
    const confirmed = window.confirm(
      `Terima pengajuan ${item.status.toLowerCase()} dari ${item.user.nama} untuk tanggal ${formatTanggal(
        item.tanggal
      )}?`
    );

    if (!confirmed) return;

    await processRequest(item.id, "DITERIMA", "");
  };

  // =====================================================
  // BUKA TOLAK
  // =====================================================
  const openRejectModal = (item: LeaveRequest) => {
    setSelectedRequest(item);
    setCatatanAdmin("");
    setShowReject(true);
  };

  // =====================================================
  // TOLAK
  // =====================================================
  const handleReject = async () => {
    if (!selectedRequest) return;

    if (!catatanAdmin.trim()) {
      setMessage("Catatan penolakan wajib diisi.");
      setMessageType("error");
      return;
    }

    await processRequest(
      selectedRequest.id,
      "DITOLAK",
      catatanAdmin.trim()
    );
  };

  // =====================================================
  // DETAIL
  // =====================================================
  const openDetail = (item: LeaveRequest) => {
    setSelectedRequest(item);
    setShowDetail(true);
  };

  // =====================================================
  // STATUS BADGE
  // =====================================================
  const statusBadge = (status: string) => {
    if (status === "MENUNGGU") {
      return (
        <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
          Menunggu
        </span>
      );
    }

    if (status === "DITERIMA") {
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          Diterima
        </span>
      );
    }

    if (status === "DITOLAK") {
      return (
        <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
          Ditolak
        </span>
      );
    }

    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
        {status}
      </span>
    );
  };

  // =====================================================
  // JENIS IZIN / SAKIT
  // =====================================================
  const typeBadge = (status: string) => {
    if (status === "SAKIT") {
      return (
        <span className="inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
          🤒 Sakit
        </span>
      );
    }

    return (
      <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
        📄 Izin
      </span>
    );
  };

  // =====================================================
  // LOADING
  // =====================================================
  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl bg-white px-8 py-6 text-center shadow-sm">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="text-sm text-slate-600">
            Memuat halaman...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={() => router.push("/admin")}
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
            >
              ← Kembali ke Dashboard
            </button>

            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
              Pengajuan Izin & Sakit
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Kelola pengajuan izin dan sakit siswa.
            </p>
          </div>

          <button
            onClick={loadRequests}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            🔄
            {loading ? "Memuat..." : "Refresh Data"}
          </button>
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

        {/* =================================================
            STATISTICS
        ================================================= */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm text-slate-500">
              Total Pengajuan
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-800">
              {totalPengajuan}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm text-slate-500">
              Menunggu
            </p>
            <p className="mt-2 text-3xl font-bold text-amber-600">
              {totalMenunggu}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm text-slate-500">
              Diterima
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {totalDiterima}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm text-slate-500">
              Ditolak
            </p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {totalDitolak}
            </p>
          </div>
        </div>

        {/* =================================================
            FILTER
        ================================================= */}
        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex flex-wrap gap-2">
              {[
                ["SEMUA", "Semua"],
                ["MENUNGGU", "Menunggu"],
                ["DITERIMA", "Diterima"],
                ["DITOLAK", "Ditolak"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    filter === value
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="relative w-full lg:max-w-sm">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                🔎
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama, NIS, kelas..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        {/* =================================================
            TABLE / LIST
        ================================================= */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">

          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-bold text-slate-800">
                Daftar Pengajuan
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Menampilkan {filteredRequests.length} pengajuan
              </p>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
              <p className="text-sm text-slate-500">
                Memuat data pengajuan...
              </p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mb-3 text-5xl">📭</div>

              <h3 className="font-semibold text-slate-700">
                Belum ada pengajuan
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Tidak ada data yang sesuai dengan filter.
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Siswa
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Tanggal
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Jenis
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRequests.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-800">
                            {item.user.nama}
                          </div>

                          <div className="mt-1 text-xs text-slate-500">
                            {item.user.nis || "-"} •{" "}
                            {item.user.kelas || "-"}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {formatTanggal(item.tanggal)}
                        </td>

                        <td className="px-5 py-4">
                          {typeBadge(item.status)}
                        </td>

                        <td className="px-5 py-4">
                          {statusBadge(item.statusPengajuan)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openDetail(item)}
                              className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                            >
                              Detail
                            </button>

                            {item.statusPengajuan ===
                              "MENUNGGU" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleAccept(item)
                                  }
                                  disabled={processing}
                                  className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                                >
                                  Terima
                                </button>

                                <button
                                  onClick={() =>
                                    openRejectModal(item)
                                  }
                                  disabled={processing}
                                  className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                                >
                                  Tolak
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE */}
              <div className="space-y-4 p-4 md:hidden">
                {filteredRequests.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-800">
                          {item.user.nama}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          {item.user.nis || "-"} •{" "}
                          {item.user.kelas || "-"}
                        </p>
                      </div>

                      {statusBadge(item.statusPengajuan)}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">
                          Tanggal
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {formatTanggal(item.tanggal)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">
                          Jenis
                        </p>

                        <div className="mt-1">
                          {typeBadge(item.status)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">
                        Alasan
                      </p>

                      <p className="mt-1 line-clamp-2 text-sm text-slate-700">
                        {item.alasan}
                      </p>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => openDetail(item)}
                        className="flex-1 rounded-xl bg-slate-100 px-3 py-2.5 text-xs font-semibold text-slate-700"
                      >
                        Detail
                      </button>

                      {item.statusPengajuan === "MENUNGGU" && (
                        <>
                          <button
                            onClick={() => handleAccept(item)}
                            disabled={processing}
                            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50"
                          >
                            ✓
                          </button>

                          <button
                            onClick={() =>
                              openRejectModal(item)
                            }
                            disabled={processing}
                            className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50"
                          >
                            ✕
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ===================================================
          DETAIL MODAL
      =================================================== */}
      {showDetail && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Detail Pengajuan
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  ID Pengajuan #{selectedRequest.id}
                </p>
              </div>

              <button
                onClick={() => setShowDetail(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 p-6">

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Siswa
                </p>

                <p className="mt-1 text-lg font-bold text-slate-800">
                  {selectedRequest.user.nama}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  NIS: {selectedRequest.user.nis || "-"}
                </p>

                <p className="text-sm text-slate-500">
                  Kelas: {selectedRequest.user.kelas || "-"}
                </p>

                <p className="text-sm text-slate-500">
                  Jurusan:{" "}
                  {selectedRequest.user.jurusan || "-"}
                </p>

                <p className="text-sm text-slate-500">
                  Tempat PKL:{" "}
                  {selectedRequest.user.tempatPkl || "-"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-400">
                    Tanggal
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {formatTanggal(selectedRequest.tanggal)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-400">
                    Jenis
                  </p>

                  <div className="mt-2">
                    {typeBadge(selectedRequest.status)}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs text-slate-400">
                  Alasan
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {selectedRequest.alasan}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs text-slate-400">
                  Diajukan
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  {formatTanggalWaktu(
                    selectedRequest.createdAt
                  )}
                </p>
              </div>

              {selectedRequest.catatanAdmin && (
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-400">
                    Catatan Admin
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                    {selectedRequest.catatanAdmin}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowDetail(false)}
                  className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Tutup
                </button>

                {selectedRequest.statusPengajuan ===
                  "MENUNGGU" && (
                  <>
                    <button
                      onClick={() => {
                        setShowDetail(false);
                        handleAccept(selectedRequest);
                      }}
                      disabled={processing}
                      className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Terima
                    </button>

                    <button
                      onClick={() => {
                        setShowDetail(false);
                        openRejectModal(selectedRequest);
                      }}
                      disabled={processing}
                      className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      Tolak
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          REJECT MODAL
      =================================================== */}
      {showReject && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl">

            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="text-lg font-bold text-slate-800">
                Tolak Pengajuan
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Pengajuan dari{" "}
                <span className="font-semibold text-slate-700">
                  {selectedRequest.user.nama}
                </span>
              </p>
            </div>

            <div className="p-6">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Catatan / alasan penolakan
              </label>

              <textarea
                value={catatanAdmin}
                onChange={(e) =>
                  setCatatanAdmin(e.target.value)
                }
                rows={5}
                placeholder="Tuliskan alasan pengajuan ditolak..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 outline-none transition focus:border-red-400 focus:bg-white focus:ring-2 focus:ring-red-100"
              />

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => {
                    setShowReject(false);
                    setCatatanAdmin("");
                  }}
                  disabled={processing}
                  className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  onClick={handleReject}
                  disabled={
                    processing || !catatanAdmin.trim()
                  }
                  className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {processing ? "Memproses..." : "Tolak Pengajuan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}