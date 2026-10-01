"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch("/api/login", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login gagal");
        return;
      }

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      if (data.user.role === "ADMIN") {
        router.push("/admin");

      } else if (data.user.role === "SISWA") {
        router.push("/dashboard");

      } else if (data.user.role === "PEMBIMBING") {
        router.push("/pembimbing/dashboard");

      } else if (data.user.role === "KETUA_JURUSAN") {
        router.push("/ketua-jurusan/dashboard");
      }

    } catch {
      setMessage("Terjadi kesalahan pada server");

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100">

      <div className="bg-white shadow-xl rounded-xl p-8 w-[400px]">

        <h1 className="text-3xl font-bold text-center text-blue-600">
          PKL Attendance
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-6">
          Login Sistem Presensi PKL
        </p>

        <form
          onSubmit={handleLogin}
          className="space-y-4"
        >

          <div>
            <label>Username</label>

            <input
              type="text"
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border rounded-lg p-2 mt-1"
            />
          </div>

          <div>
            <label>Password</label>

            <input
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg p-2 mt-1"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-2 disabled:bg-gray-400"
          >
            {loading ? "Memproses..." : "Login"}
          </button>

          {message && (
            <p className="text-center text-red-500">
              {message}
            </p>
          )}

        </form>

      </div>

    </main>
  );
}