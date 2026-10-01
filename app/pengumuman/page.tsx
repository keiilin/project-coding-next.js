"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PengumumanPage() {
  const router = useRouter();

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(storedUser));
  }, [router]);

  const getAnnouncements = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/announcements");

      const data = await response.json();

      if (response.ok) {
        setAnnouncements(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getAnnouncements();
    }
  }, [user]);

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Memuat...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-10">
      <div className="max-w-4xl mx-auto">

        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            Pengumuman
          </h1>

          <p className="text-gray-600 mt-2">
            Informasi terbaru mengenai kegiatan PKL
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow p-8">
            Memuat pengumuman...
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <p className="text-gray-500">
              Belum ada pengumuman.
            </p>
          </div>
        ) : (
          <div className="space-y-5">

            {announcements.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow p-6"
              >
                <div className="flex justify-between items-start gap-4">

                  <h2 className="text-xl font-bold">
                    {item.judul}
                  </h2>

                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {new Date(
                      item.createdAt
                    ).toLocaleDateString("id-ID")}
                  </span>

                </div>

                <p className="text-gray-600 mt-4 whitespace-pre-line">
                  {item.isi}
                </p>

              </div>
            ))}

          </div>
        )}

      </div>
    </main>
  );
}