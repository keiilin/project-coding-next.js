import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const userId = Number(body.id);
    const aktif = body.aktif;

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json(
        { message: "ID user tidak valid" },
        { status: 400 }
      );
    }

    if (typeof aktif !== "boolean") {
      return NextResponse.json(
        { message: "Status akun tidak valid" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // Mencegah admin menonaktifkan dirinya sendiri
    if (user.role === "ADMIN" && !aktif) {
      return NextResponse.json(
        {
          message:
            "Akun admin tidak dapat dinonaktifkan melalui menu ini.",
        },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        aktif,
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
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: aktif
          ? "Akun berhasil diaktifkan"
          : "Akun berhasil dinonaktifkan",
        data: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("UPDATE USER STATUS ERROR:", error);

    return NextResponse.json(
      {
        message: "Gagal mengubah status akun",
      },
      { status: 500 }
    );
  }
}