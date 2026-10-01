import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const adminId = Number(body.adminId);

    const nama = String(body.nama || "").trim();
    const username = String(body.username || "").trim();
    const password = String(body.password || "").trim();
    const role = String(body.role || "SISWA").trim();

    const nis =
      body.nis !== undefined && body.nis !== null
        ? String(body.nis).trim() || null
        : null;

    const kelas =
      body.kelas !== undefined && body.kelas !== null
        ? String(body.kelas).trim() || null
        : null;

    const jurusan =
      body.jurusan !== undefined && body.jurusan !== null
        ? String(body.jurusan).trim() || null
        : null;

    const tempatPkl =
      body.tempatPkl !== undefined && body.tempatPkl !== null
        ? String(body.tempatPkl).trim() || null
        : null;

    if (!adminId || Number.isNaN(adminId)) {
      return NextResponse.json(
        { message: "ID admin tidak valid." },
        { status: 400 }
      );
    }

    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { message: "Admin tidak ditemukan." },
        { status: 404 }
      );
    }

    if (admin.role !== "ADMIN") {
      return NextResponse.json(
        {
          message:
            "Akses ditolak. Hanya admin yang dapat menambahkan user.",
        },
        { status: 403 }
      );
    }

    if (!nama) {
      return NextResponse.json(
        { message: "Nama wajib diisi." },
        { status: 400 }
      );
    }

    if (!username) {
      return NextResponse.json(
        { message: "Username wajib diisi." },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { message: "Password wajib diisi." },
        { status: 400 }
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
        { message: "Role tidak valid." },
        { status: 400 }
      );
    }

    const existingUsername = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (existingUsername) {
      return NextResponse.json(
        {
          message: "Username sudah digunakan.",
        },
        { status: 409 }
      );
    }

    if (nis) {
      const existingNis = await prisma.user.findUnique({
        where: {
          nis,
        },
      });

      if (existingNis) {
        return NextResponse.json(
          {
            message: "NIS sudah digunakan.",
          },
          { status: 409 }
        );
      }
    }

    const user = await prisma.user.create({
      data: {
        nama,
        username,
        password,
        role: role as
          | "ADMIN"
          | "SISWA"
          | "PEMBIMBING"
          | "KETUA_JURUSAN",
        nis,
        kelas,
        jurusan,
        tempatPkl,
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
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "User berhasil ditambahkan.",
        data: user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE ADMIN USER ERROR:", error);

    return NextResponse.json(
      {
        message: "Terjadi kesalahan saat menambahkan user.",
      },
      { status: 500 }
    );
  }
}