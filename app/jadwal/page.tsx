"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const daftarHari = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

export default function JadwalPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [form, setForm] = useState({
    hari: "Senin",
    jamMasuk: "",
    jamPulang: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      localStorage.removeItem("user");
      router.push("/login");
    }
  }, [router]);

  const getSchedules = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const response = await fetch(
        `/api/schedule?userId=${user.id}`
      );

      const data = await response.json();

      if (response.ok) {
        setSchedules(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getSchedules();
    }
  }, [user]);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!user) return;

    try {
      setProcessing(true);

      const response = await fetch(
        "/api/schedule",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            userId: user.id,
            ...form,
          }),
        }
      );

      const data = await response.json();

      alert(data.message);

      if (response.ok) {
        setForm({
          hari: "Senin",
          jamMasuk: "",
          jamPulang: "",
        });

        getSchedules();
      }

    } catch (error) {
      console.error(error);

      alert("Terjadi kesalahan");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Memuat...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-10">

      <div className="max-w-5xl mx-auto">

        <div className="mb-8">

          <h1 className="text-4xl font-bold">
            Jadwal PKL
          </h1>

          <p className="text-gray-600 mt-2">
            Atur jadwal masuk dan pulang sesuai tempat PKL kamu.
          </p>

        </div>

        <div className="grid md:grid-cols-2 gap-6">

          <div className="bg-white rounded-xl shadow p-6">

            <h2 className="text-xl font-bold mb-6">
              Tambah Jadwal
            </h2>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              <div>

                <label className="block mb-2 font-medium">
                  Hari
                </label>

                <select
                  value={form.hari}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      hari: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg p-3"
                >

                  {daftarHari.map((hari) => (
                    <option
                      key={hari}
                      value={hari}
                    >
                      {hari}
                    </option>
                  ))}

                </select>

              </div>

              <div>

                <label className="block mb-2 font-medium">
                  Jam Masuk
                </label>

                <input
                  type="time"
                  value={form.jamMasuk}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      jamMasuk: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg p-3"
                  required
                />

              </div>

              <div>

                <label className="block mb-2 font-medium">
                  Jam Pulang
                </label>

                <input
                  type="time"
                  value={form.jamPulang}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      jamPulang: e.target.value,
                    })
                  }
                  className="w-full border rounded-lg p-3"
                  required
                />

              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg"
              >
                {processing
                  ? "Menyimpan..."
                  : "Simpan Jadwal"}
              </button>

            </form>

          </div>

          <div className="bg-white rounded-xl shadow p-6">

            <h2 className="text-xl font-bold mb-6">
              Jadwal Saya
            </h2>

            {schedules.length === 0 ? (

              <p className="text-gray-500">
                Belum ada jadwal.
              </p>

            ) : (

              <div className="space-y-3">

                {schedules.map((item) => (

                  <div
                    key={item.id}
                    className="border rounded-lg p-4 flex justify-between items-center"
                  >

                    <div>

                      <h3 className="font-semibold">
                        {item.hari}
                      </h3>

                    </div>

                    <div className="text-right">

                      <p className="font-medium">
                        {item.jamMasuk} - {item.jamPulang}
                      </p>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        </div>

      </div>

    </main>
  );
}