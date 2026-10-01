"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function KetuaJurusanSiswaPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(storedUser);

    if (userData.role !== "KETUA_JURUSAN") {
      router.push("/login");
      return;
    }

    setUser(userData);
  }, [router]);

  const getStudents = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/ketua-jurusan/siswa"
      );

      const data = await response.json();

      if (response.ok) {
        setStudents(data.data);
      }

    } catch (error) {
      console.error(error);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getStudents();
    }
  }, [user]);

  if (!user || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Memuat data siswa...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-10">

      <div className="max-w-7xl mx-auto">

        <div className="flex justify-between items-center mb-8">

          <div>
            <h1 className="text-4xl font-bold">
              Data Siswa PKL
            </h1>

            <p className="text-gray-600 mt-2">
              Monitoring seluruh siswa yang sedang melaksanakan PKL.
            </p>
          </div>

          <button
            onClick={getStudents}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg"
          >
            Refresh
          </button>

        </div>

        <div className="bg-white rounded-xl shadow p-6">

          {students.length === 0 ? (

            <div className="text-center py-10">
              <p className="text-gray-500">
                Belum ada data siswa.
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
                      Nama
                    </th>

                    <th className="border p-3 text-left">
                      NIS
                    </th>

                    <th className="border p-3 text-left">
                      Kelas
                    </th>

                    <th className="border p-3 text-left">
                      Jurusan
                    </th>

                    <th className="border p-3 text-left">
                      Tempat PKL
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {students.map((student, index) => (

                    <tr key={student.id}>

                      <td className="border p-3">
                        {index + 1}
                      </td>

                      <td className="border p-3 font-semibold">
                        {student.nama}
                      </td>

                      <td className="border p-3">
                        {student.nis || "-"}
                      </td>

                      <td className="border p-3">
                        {student.kelas || "-"}
                      </td>

                      <td className="border p-3">
                        {student.jurusan || "-"}
                      </td>

                      <td className="border p-3">
                        {student.tempatPkl || "-"}
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