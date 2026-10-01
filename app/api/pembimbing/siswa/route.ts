import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const siswa = await prisma.user.findMany({
      where: {
        role: "SISWA",
        aktif: true,
      },
      select: {
        id: true,
        nama: true,
        username: true,
        nis: true,
        kelas: true,
        jurusan: true,
        tempatPkl: true,
      },
      orderBy: {
        nama: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: siswa,
    });
  } catch (error) {
    console.error("GET DATA SISWA ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data siswa.",
      },
      {
        status: 500,
      }
    );
  }
}