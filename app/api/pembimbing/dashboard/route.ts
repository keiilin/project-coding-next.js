import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET() {
  try {
    const totalStudents = await prisma.user.count({
      where: {
        role: "SISWA",
      },
    });

    const totalJournals = await prisma.journal.count();

    const today = new Date();

    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59
    );

    const attendanceToday =
      await prisma.attendance.count({
        where: {
          tanggal: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

    const recentAttendances =
      await prisma.attendance.findMany({
        include: {
          user: {
            select: {
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

        take: 10,
      });

    return NextResponse.json({
      data: {
        totalStudents,
        attendanceToday,
        totalJournals,
        recentAttendances,
      },
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Gagal mengambil dashboard pembimbing",
      },
      {
        status: 500,
      }
    );
  }
}