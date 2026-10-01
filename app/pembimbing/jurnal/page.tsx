"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PembimbingJurnalPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(storedUser);

    if (userData.role !== "PEMBIMBING") {
      router.push("/login");
      return;
    }

    setUser(userData);
  }, [router]);

  const getJournals = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/pembimbing/jurnal"
      );

      const data = await response.json();

      if (response.ok) {
        setJournals(data.data);
      } else {
        console.error(data.message);
      }

    } catch (error) {
      console.error(error);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getJournals();
    }
  }, [user]);

  if (!user || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Memuat jurnal...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-10">

      <div className="max-w-7xl mx-auto">

        <div className="flex justify-between items-center mb-8">

          <div>
            <h1 className="text-4xl font-bold">
              Jurnal Kegiatan Siswa
            </h1>

            <p className="text-gray-600 mt-2">
              Pantau kegiatan harian siswa selama PKL.
            </p>
          </div>

          <button
            onClick={getJournals}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg"
          >
            Refresh
          </button>

        </div>


        <div className="bg-white rounded-xl shadow p-6">

          {journals.length === 0 ? (

            <div className="text-center py-10">

              <p className="text-gray-500">
                Belum ada jurnal dari siswa.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full border-collapse">

                <thead>

                  <tr className="bg-slate-100">

                    <th className="border p-3 text-left">
                      No
                    </th>

                    <th className="border p-3 text-left">
                      Nama Siswa
                    </th>

                    <th className="border p-3 text-left">
                      Tanggal
                    </th>

                    <th className="border p-3 text-left">
                      Kegiatan
                    </th>

                    <th className="border p-3 text-left">
                      Kendala
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {journals.map((item, index) => (

                    <tr key={item.id}>

                      <td className="border p-3">
                        {index + 1}
                      </td>


                      <td className="border p-3">

                        <p className="font-semibold">
                          {item.user.nama}
                        </p>

                        <p className="text-sm text-gray-500">
                          {item.user.kelas || "-"}
                        </p>

                      </td>


                      <td className="border p-3">

                        {new Date(
                          item.tanggal
                        ).toLocaleDateString("id-ID")}

                      </td>


                      <td className="border p-3 max-w-md">

                        {item.kegiatan}

                      </td>


                      <td className="border p-3 max-w-md">

                        {item.kendala || "-"}

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