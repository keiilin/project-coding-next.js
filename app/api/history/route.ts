import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!userId) {
      return NextResponse.json(
        {
          message: "User ID tidak ditemukan",
        },
        {
          status: 400,
        }
      );
    }

    const where: any = {
      userId: Number(userId),
    };

    if (startDate || endDate) {
      where.tanggal = {};

      if (startDate) {
        where.tanggal.gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        where.tanggal.lte = end;
      }
    }

    const attendances = await prisma.attendance.findMany({
      where,

      orderBy: {
        tanggal: "desc",
      },

      include: {
        user: {
          select: {
            nama: true,
            kelas: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Riwayat absensi berhasil diambil",
      data: attendances,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Terjadi kesalahan server",
      },
      {
        status: 500,
      }
    );
  }
}