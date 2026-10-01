import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET() {
  try {
    const attendances =
      await prisma.attendance.findMany({
        include: {
          user: {
            select: {
              id: true,
              nama: true,
              kelas: true,
              jurusan: true,
              tempatPkl: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json({
      data: attendances,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Gagal mengambil data absensi",
      },
      {
        status: 500,
      }
    );
  }
}