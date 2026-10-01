import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        nama: true,
        username: true,
        role: true,
        nis: true,
        kelas: true,
        jurusan: true,
        tempatPkl: true,
        aktif: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      message: "Data user berhasil diambil",
      data: users,
    });
  } catch (error) {
    console.error("GET USERS ERROR:", error);

    return NextResponse.json(
      {
        message: "Gagal mengambil data user",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      nama,
      username,
      password,
      role,
      nis,
      kelas,
      jurusan,
      tempatPkl,
    } = body;

    // =========================
    // VALIDASI
    // =========================

    if (!nama || !username || !password || !role) {
      return NextResponse.json(
        {
          message:
            "Nama, username, password, dan role wajib diisi",
        },
        {
          status: 400,
        }
      );
    }

    const allowedRoles = [
      "ADMIN",
      "SISWA",
      "PEMBIMBING",
      "KETUA_JURUSAN",
    ];

    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        {
          message: "Role tidak valid",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // CEK USERNAME
    // =========================

    const existingUsername = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (existingUsername) {
      return NextResponse.json(
        {
          message: "Username sudah digunakan",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // CEK NIS
    // =========================

    if (nis) {
      const existingNis = await prisma.user.findUnique({
        where: {
          nis,
        },
      });

      if (existingNis) {
        return NextResponse.json(
          {
            message: "NIS sudah digunakan",
          },
          {
            status: 400,
          }
        );
      }
    }

    // =========================
    // HASH PASSWORD
    // =========================

    const hashedPassword = await bcrypt.hash(password, 10);

    // =========================
    // CREATE USER
    // =========================

    const user = await prisma.user.create({
      data: {
        nama,
        username,
        password: hashedPassword,
        role,
        nis: nis || null,
        kelas: kelas || null,
        jurusan: jurusan || null,
        tempatPkl: tempatPkl || null,
      },

      select: {
        id: true,
        nama: true,
        username: true,
        role: true,
        nis: true,
        kelas: true,
        jurusan: true,
        tempatPkl: true,
        aktif: true,
      },
    });

    return NextResponse.json(
      {
        message: "User berhasil ditambahkan",
        data: user,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("CREATE USER ERROR:", error);

    return NextResponse.json(
      {
        message: "Gagal menambahkan user",
      },
      {
        status: 500,
      }
    );
  }
}