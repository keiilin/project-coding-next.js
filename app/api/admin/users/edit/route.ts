import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      id,
      nama,
      username,
      password,
      role,
      nis,
      kelas,
      jurusan,
      tempatPkl,
    } = body;

    const userId = Number(id);

    // =========================
    // VALIDASI ID
    // =========================

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json(
        {
          message: "ID user tidak valid",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // VALIDASI DATA WAJIB
    // =========================

    if (!nama || !username || !role) {
      return NextResponse.json(
        {
          message: "Nama, username, dan role wajib diisi",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // VALIDASI ROLE
    // =========================

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
    // CEK USER
    // =========================

    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          message: "User tidak ditemukan",
        },
        {
          status: 404,
        }
      );
    }

    // =========================
    // CEK USERNAME
    // =========================

    const usernameOwner = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (usernameOwner && usernameOwner.id !== userId) {
      return NextResponse.json(
        {
          message: "Username sudah digunakan oleh user lain",
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
      const nisOwner = await prisma.user.findUnique({
        where: {
          nis,
        },
      });

      if (nisOwner && nisOwner.id !== userId) {
        return NextResponse.json(
          {
            message: "NIS sudah digunakan oleh user lain",
          },
          {
            status: 400,
          }
        );
      }
    }

    // =========================
    // DATA YANG AKAN DIUPDATE
    // =========================

    const updateData: {
      nama: string;
      username: string;
      role: "ADMIN" | "SISWA" | "PEMBIMBING" | "KETUA_JURUSAN";
      nis: string | null;
      kelas: string | null;
      jurusan: string | null;
      tempatPkl: string | null;
      password?: string;
    } = {
      nama,
      username,
      role,
      nis: nis || null,
      kelas: kelas || null,
      jurusan: jurusan || null,
      tempatPkl: tempatPkl || null,
    };

    // =========================
    // UPDATE PASSWORD
    // =========================

    if (password && String(password).trim() !== "") {
      updateData.password = await bcrypt.hash(
        String(password),
        10
      );
    }

    // =========================
    // UPDATE USER
    // =========================

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },

      data: updateData,

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
    });

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json(
      {
        message: "User berhasil diperbarui",
        data: updatedUser,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("EDIT USER ERROR:", error);

    return NextResponse.json(
      {
        message: "Gagal memperbarui user",
      },
      {
        status: 500,
      }
    );
  }
}