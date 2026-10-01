import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const students = await prisma.user.findMany({
      where: {
        role: "SISWA",
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
      data: students,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Gagal mengambil data siswa",
      },
      {
        status: 500,
      }
    );
  }
}