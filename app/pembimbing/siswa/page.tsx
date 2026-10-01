"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Siswa = {
  id: number;
  nama: string;
  username: string;
  nis: string | null;
  kelas: string | null;
  jurusan: string | null;
  tempatPkl: string | null;
};

export default function DataSiswaPage() {
  const router = useRouter();

  const [siswa, setSiswa] = useState<Siswa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      if (user.role !== "PEMBIMBING") {
        router.push("/login");
        return;
      }

      loadSiswa();
    } catch (error) {
      console.error(error);
      router.push("/login");
    }
  }, [router]);

  async function loadSiswa() {
    try {
      setLoading(true);

      const response = await fetch("/api/pembimbing/siswa");
      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Gagal mengambil data siswa.");
        return;
      }

      setSiswa(data.data || []);
    } catch (error) {
      console.error("LOAD SISWA ERROR:", error);
      alert("Terjadi kesalahan saat mengambil data siswa.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />

          <p className="text-slate-600">
            Memuat data siswa...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <p className="text-sm text-slate-500">
            Sistem Presensi PKL
          </p>

          <h1 className="text-2xl font-bold text-slate-800 mt-1">
            Data Siswa
          </h1>

          <p className="text-slate-500 mt-2">
            Daftar siswa yang terdaftar dalam sistem PKL.
          </p>
        </div>

        {/* JUMLAH SISWA */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <p className="text-sm text-slate-500">
            Total Siswa
          </p>

          <p className="text-3xl font-bold text-blue-600 mt-1">
            {siswa.length}
          </p>
        </div>

        {/* DATA SISWA */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

          <div className="p-6 border-b">
            <h2 className="text-lg font-bold text-slate-800">
              Daftar Siswa
            </h2>
          </div>

          {siswa.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-500">
                Belum ada data siswa.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">

                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                      No
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                      Nama
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                      NIS
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                      Kelas
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                      Jurusan
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                      Tempat PKL
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {siswa.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {index + 1}
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">
                          {item.nama}
                        </p>

                        <p className="text-xs text-slate-400">
                          {item.username}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {item.nis || "-"}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {item.kelas || "-"}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {item.jurusan || "-"}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {item.tempatPkl || "-"}
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