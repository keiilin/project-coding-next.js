import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        {
          message: "Username dan password wajib diisi",
        },
        {
          status: 400,
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "Username tidak ditemukan",
        },
        {
          status: 401,
        }
      );
    }

    // =========================
    // CEK STATUS AKUN
    // =========================

    if (!user.aktif) {
      return NextResponse.json(
        {
          message:
            "Akun kamu sedang dinonaktifkan. Silakan hubungi admin untuk mengaktifkan kembali akun.",
        },
        {
          status: 403,
        }
      );
    }

    // =========================
    // CEK PASSWORD
    // =========================

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return NextResponse.json(
        {
          message: "Password salah",
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json({
      message: "Login berhasil",
      user: {
        id: user.id,
        nama: user.nama,
        username: user.username,
        role: user.role,
        kelas: user.kelas,
        jurusan: user.jurusan,
        tempatPkl: user.tempatPkl,
        aktif: user.aktif,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        message: "Terjadi kesalahan pada server",
      },
      {
        status: 500,
      }
    );
  }
}