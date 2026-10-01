"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TempatPklPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [tempatPkl, setTempatPkl] = useState<any[]>([]);
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

  const getTempatPkl = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/ketua-jurusan/tempat-pkl"
      );

      const data = await response.json();

      if (response.ok) {
        setTempatPkl(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getTempatPkl();
    }
  }, [user]);

  if (!user || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Memuat data...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-10">

      <div className="max-w-6xl mx-auto">

        <div className="flex justify-between items-center mb-8">

          <div>
            <h1 className="text-4xl font-bold">
              Data Tempat PKL
            </h1>

            <p className="text-gray-600 mt-2">
              Daftar tempat pelaksanaan PKL siswa.
            </p>
          </div>

          <button
            onClick={getTempatPkl}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg"
          >
            Refresh
          </button>

        </div>

        {tempatPkl.length === 0 ? (

          <div className="bg-white rounded-xl shadow p-10 text-center">

            <p className="text-gray-500">
              Belum ada data tempat PKL.
            </p>

          </div>

        ) : (

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {tempatPkl.map((item, index) => (

              <div
                key={index}
                className="bg-white rounded-xl shadow p-6"
              >

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-gray-500 text-sm">
                      Tempat PKL
                    </p>

                    <h2 className="text-xl font-bold mt-2">
                      {item.nama}
                    </h2>

                  </div>

                  <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center font-bold">

                    {item.total}

                  </div>

                </div>

                <p className="text-gray-500 mt-4">
                  {item.total} siswa PKL
                </p>

              </div>

            ))}

          </div>

        )}

      </div>

    </main>
  );
}