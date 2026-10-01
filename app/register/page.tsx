"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    nama: "",
    username: "",
    password: "",
    nis: "",
    kelas: "",
    jurusan: "",
    tempatPkl: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Pendaftaran gagal.");
        return;
      }

      alert("Pendaftaran berhasil!");

      router.push("/login");
    } catch (error) {
      console.error(error);
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Daftar Akun
          </h1>

          <p className="text-slate-500 mt-2">
            Sistem Informasi Kehadiran Siswa PKL
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg bg-red-100 border border-red-300 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Nama */}
          <div>
            <label className="block mb-2 font-medium text-slate-700">
              Nama Lengkap
            </label>

            <input
              type="text"
              name="nama"
              value={form.nama}
              onChange={handleChange}
              placeholder="Masukkan nama lengkap"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block mb-2 font-medium text-slate-700">
              Username
            </label>

            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Masukkan username"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-2 font-medium text-slate-700">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Masukkan password"
              required
              minLength={6}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* NIS */}
          <div>
            <label className="block mb-2 font-medium text-slate-700">
              NIS
            </label>

            <input
              type="text"
              name="nis"
              value={form.nis}
              onChange={handleChange}
              placeholder="Masukkan NIS"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Kelas & Jurusan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label className="block mb-2 font-medium text-slate-700">
                Kelas
              </label>

              <input
                type="text"
                name="kelas"
                value={form.kelas}
                onChange={handleChange}
                placeholder="Contoh: XI RPL 2"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-slate-700">
                Jurusan
              </label>

              <input
                type="text"
                name="jurusan"
                value={form.jurusan}
                onChange={handleChange}
                placeholder="Contoh: RPL"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

          </div>

          {/* Tempat PKL */}
          <div>
            <label className="block mb-2 font-medium text-slate-700">
              Tempat PKL
            </label>

            <input
              type="text"
              name="tempatPkl"
              value={form.tempatPkl}
              onChange={handleChange}
              placeholder="Masukkan nama tempat PKL"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {loading ? "Mendaftarkan..." : "Daftar"}
          </button>

        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Sudah memiliki akun?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Login
          </Link>
        </p>

      </div>
    </main>
  );
}