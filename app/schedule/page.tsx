"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Schedule {
  id: number;
  hari: string;
  jamMasuk: string;
  jamPulang: string;
}

const daftarHari = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];

export default function SchedulePage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [hari, setHari] = useState("Senin");
  const [jamMasuk, setJamMasuk] = useState("");
  const [jamPulang, setJamPulang] = useState("");

  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(storedUser);

    if (userData.role !== "SISWA") {
      router.push("/login");
      return;
    }

    setUser(userData);
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
        setSchedules(data.data || []);
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

    if (!jamMasuk || !jamPulang) {
      alert("Jam masuk dan jam pulang wajib diisi");
      return;
    }

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
            hari,
            jamMasuk,
            jamPulang,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Gagal menyimpan jadwal"
        );
        return;
      }

      alert("Jadwal berhasil disimpan");

      setJamMasuk("");
      setJamPulang("");
      setShowForm(false);

      getSchedules();
    } catch (error) {
      console.error(error);

      alert("Terjadi kesalahan");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmation = confirm(
      "Hapus jadwal ini?"
    );

    if (!confirmation) return;

    try {
      const response = await fetch(
        `/api/schedule?id=${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Gagal menghapus jadwal"
        );
        return;
      }

      getSchedules();
    } catch (error) {
      console.error(error);
    }
  };

  if (!user && loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Memuat...
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6 md:p-8 lg:p-10">

      <div className="max-w-5xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

          <div>
            <p className="text-sm text-gray-500">
              Pengaturan Waktu PKL
            </p>

            <h1 className="text-2xl sm:text-3xl font-bold mt-1">
              Jadwal PKL
            </h1>

            <p className="text-sm text-gray-500 mt-2">
              Atur jadwal masuk dan pulang sesuai tempat PKL kamu.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold transition active:scale-95"
          >
            {showForm
              ? "Tutup Form"
              : "+ Tambah Jadwal"}
          </button>

        </div>


        {/* INFO */}

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 sm:p-5 mb-6">

          <div className="flex gap-3">

            <div className="text-xl">
              ℹ️
            </div>

            <div>
              <h3 className="font-semibold text-blue-800">
                Jadwal PKL Pribadi
              </h3>

              <p className="text-sm text-blue-700 mt-1">
                Setiap siswa dapat memiliki jadwal yang berbeda
                sesuai dengan aturan tempat PKL masing-masing.
              </p>
            </div>

          </div>

        </div>


        {/* FORM */}

        {showForm && (

          <div className="bg-white border rounded-2xl shadow-sm p-5 sm:p-6 mb-6">

            <h2 className="text-lg font-bold mb-5">
              Tambah Jadwal
            </h2>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* HARI */}

              <div>

                <label className="block font-medium mb-2">
                  Hari
                </label>

                <select
                  value={hari}
                  onChange={(e) =>
                    setHari(e.target.value)
                  }
                  className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >

                  {daftarHari.map((item) => (

                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>

                  ))}

                </select>

              </div>


              {/* JAM */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>

                  <label className="block font-medium mb-2">
                    Jam Masuk
                  </label>

                  <input
                    type="time"
                    value={jamMasuk}
                    onChange={(e) =>
                      setJamMasuk(e.target.value)
                    }
                    className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                </div>


                <div>

                  <label className="block font-medium mb-2">
                    Jam Pulang
                  </label>

                  <input
                    type="time"
                    value={jamPulang}
                    onChange={(e) =>
                      setJamPulang(e.target.value)
                    }
                    className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                </div>

              </div>


              {/* BUTTON */}

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="w-full sm:w-auto border px-5 py-3 rounded-xl hover:bg-gray-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-semibold"
                >
                  {processing
                    ? "Menyimpan..."
                    : "Simpan Jadwal"}
                </button>

              </div>

            </form>

          </div>

        )}


        {/* LIST */}

        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">

          <div className="p-5 sm:p-6 border-b">

            <h2 className="text-lg sm:text-xl font-bold">
              Jadwal Saya
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Jadwal rutin selama pelaksanaan PKL.
            </p>

          </div>


          {loading ? (

            <div className="p-10 text-center text-gray-500">
              Memuat jadwal...
            </div>

          ) : schedules.length === 0 ? (

            <div className="p-10 sm:p-16 text-center">

              <div className="text-5xl mb-4">
                🕒
              </div>

              <h3 className="font-bold text-lg">
                Belum Ada Jadwal
              </h3>

              <p className="text-gray-500 text-sm mt-2">
                Tambahkan jadwal PKL kamu terlebih dahulu.
              </p>

              <button
                onClick={() => setShowForm(true)}
                className="mt-5 bg-blue-600 text-white px-5 py-3 rounded-xl"
              >
                Tambah Jadwal
              </button>

            </div>

          ) : (

            <div className="divide-y">

              {schedules.map((schedule) => (

                <div
                  key={schedule.id}
                  className="p-4 sm:p-5"
                >

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                    <div className="flex items-center gap-4">

                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-xl">
                        🕒
                      </div>

                      <div>

                        <h3 className="font-bold">
                          {schedule.hari}
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                          {schedule.jamMasuk}
                          {" - "}
                          {schedule.jamPulang}
                        </p>

                      </div>

                    </div>


                    <button
                      onClick={() =>
                        handleDelete(schedule.id)
                      }
                      className="w-full sm:w-auto text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition"
                    >
                      Hapus
                    </button>

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