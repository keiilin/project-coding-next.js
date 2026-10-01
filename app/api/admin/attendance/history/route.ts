import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const adminId = Number(searchParams.get("adminId"));

    // =========================
    // VALIDASI ADMIN ID
    // =========================

    if (!adminId || Number.isNaN(adminId)) {
      return NextResponse.json(
        {
          message: "ID admin tidak valid.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // CEK ADMIN
    // =========================

    const admin = await prisma.user.findUnique({
      where: {
        id: adminId,
      },
      select: {
        id: true,
        nama: true,
        username: true,
        role: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        {
          message: "Admin tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    if (admin.role !== "ADMIN") {
      return NextResponse.json(
        {
          message:
            "Akses ditolak. Hanya admin yang dapat melihat histori absensi.",
        },
        {
          status: 403,
        }
      );
    }

    // =========================
    // AMBIL HISTORI
    // =========================

    const histories = await prisma.attendanceHistory.findMany({
      orderBy: {
        createdAt: "desc",
      },

      include: {
        user: {
          select: {
            id: true,
            nama: true,
            username: true,
            nis: true,
            kelas: true,
            jurusan: true,
            tempatPkl: true,
          },
        },

        admin: {
          select: {
            id: true,
            nama: true,
            username: true,
          },
        },
      },
    });

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json(
      {
        success: true,

        data: histories,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("GET ATTENDANCE HISTORY ERROR:", error);

    return NextResponse.json(
      {
        message:
          "Terjadi kesalahan saat mengambil histori absensi.",
      },
      {
        status: 500,
      }
    );
  }
}