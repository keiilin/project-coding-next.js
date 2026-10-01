"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);

  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");
  const [jurusan, setJurusan] = useState("");
  const [tempatPkl, setTempatPkl] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const getProfile = async (userId: number) => {
    try {
      const response = await fetch(
        `/api/profile?userId=${userId}`
      );

      const data = await response.json();

      if (response.ok) {
        setUser(data.data);

        setNama(data.data.nama || "");
        setKelas(data.data.kelas || "");
        setJurusan(data.data.jurusan || "");
        setTempatPkl(data.data.tempatPkl || "");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


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

    getProfile(userData.id);
  }, [router]);


  const handleUpdate = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!user) return;

    try {
      setSaving(true);

      const response = await fetch(
        "/api/profile",
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            userId: user.id,
            nama,
            kelas,
            jurusan,
            tempatPkl,
          }),
        }
      );

      const data = await response.json();

      alert(data.message);

      if (response.ok) {

        const updatedUser = {
          ...user,
          nama,
          kelas,
          jurusan,
          tempatPkl,
        };

        setUser(updatedUser);

        localStorage.setItem(
          "user",
          JSON.stringify(updatedUser)
        );
      }

    } catch (error) {
      console.error(error);

      alert("Terjadi kesalahan saat memperbarui profil");

    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Memuat profil...
      </main>
    );
  }


  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10">

      <div className="max-w-4xl mx-auto">

        {/* HEADER */}

        <div className="mb-8">

          <p className="text-sm text-gray-500">
            Pengaturan Akun
          </p>

          <h1 className="text-3xl sm:text-4xl font-bold mt-1">
            Profil Saya
          </h1>

          <p className="text-gray-500 mt-2">
            Kelola informasi data diri dan tempat PKL kamu.
          </p>

        </div>


        <div className="grid md:grid-cols-3 gap-6">


          {/* PROFILE CARD */}

          <div className="bg-white rounded-2xl shadow-sm border p-6 h-fit">

            <div className="flex flex-col items-center text-center">

              <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl font-bold">

                {user?.nama?.charAt(0).toUpperCase()}

              </div>


              <h2 className="text-xl font-bold mt-4">

                {user?.nama}

              </h2>


              <p className="text-sm text-gray-500 mt-1">

                {user?.username}

              </p>


              <span className="mt-4 px-4 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">

                Siswa PKL

              </span>

            </div>


            <div className="border-t mt-6 pt-5 space-y-4">

              <div>

                <p className="text-xs text-gray-400">
                  NIS
                </p>

                <p className="font-medium mt-1">
                  {user?.nis || "-"}
                </p>

              </div>


              <div>

                <p className="text-xs text-gray-400">
                  Username
                </p>

                <p className="font-medium mt-1">
                  {user?.username}
                </p>

              </div>

            </div>

          </div>


          {/* FORM */}

          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border p-6 sm:p-8">

            <h2 className="text-xl font-bold mb-6">
              Informasi Profil
            </h2>


            <form
              onSubmit={handleUpdate}
              className="space-y-5"
            >


              {/* NAMA */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  Nama Lengkap
                </label>

                <input
                  type="text"
                  value={nama}
                  onChange={(e) =>
                    setNama(e.target.value)
                  }
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  placeholder="Masukkan nama lengkap"
                />

              </div>


              {/* KELAS */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  Kelas
                </label>

                <input
                  type="text"
                  value={kelas}
                  onChange={(e) =>
                    setKelas(e.target.value)
                  }
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  placeholder="Contoh: XI RPL 1"
                />

              </div>


              {/* JURUSAN */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  Jurusan
                </label>

                <input
                  type="text"
                  value={jurusan}
                  onChange={(e) =>
                    setJurusan(e.target.value)
                  }
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  placeholder="Contoh: Rekayasa Perangkat Lunak"
                />

              </div>


              {/* TEMPAT PKL */}

              <div>

                <label className="block text-sm font-medium mb-2">
                  Tempat PKL
                </label>

                <input
                  type="text"
                  value={tempatPkl}
                  onChange={(e) =>
                    setTempatPkl(e.target.value)
                  }
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  placeholder="Masukkan nama instansi atau perusahaan"
                />

              </div>


              {/* BUTTON */}

              <div className="pt-3">

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-7 py-3 rounded-xl font-medium transition"
                >

                  {saving
                    ? "Menyimpan..."
                    : "Simpan Perubahan"}

                </button>

              </div>

            </form>

          </div>

        </div>

      </div>

    </main>
  );
}