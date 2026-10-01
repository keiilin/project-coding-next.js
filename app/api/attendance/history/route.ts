import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = Number(
      searchParams.get("userId")
    );

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json(
        {
          message: "User ID tidak valid.",
        },
        {
          status: 400,
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "Data siswa tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    if (user.role !== "SISWA") {
      return NextResponse.json(
        {
          message:
            "Akses hanya diperbolehkan untuk siswa.",
        },
        {
          status: 403,
        }
      );
    }

    const attendance =
      await prisma.attendance.findMany({
        where: {
          userId: userId,
        },

        orderBy: {
          tanggal: "desc",
        },

        select: {
          id: true,
          tanggal: true,
          jamMasuk: true,
          jamPulang: true,
          status: true,
          alasanTerlambat: true,
          alasanPulangTelat: true,
          fotoMasuk: true,
          fotoPulang: true,
        },
      });

    return NextResponse.json({
      message:
        "Riwayat presensi berhasil diambil.",
      data: attendance,
    });
  } catch (error) {
    console.error(
      "ATTENDANCE HISTORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Terjadi kesalahan pada server.",
      },
      {
        status: 500,
      }
    );
  }
}