import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        {
          message: "User ID diperlukan",
        },
        {
          status: 400,
        }
      );
    }

    const id = Number(userId);

    if (Number.isNaN(id)) {
      return NextResponse.json(
        {
          message: "User ID tidak valid",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // TANGGAL HARI INI
    // =========================

    const today = new Date();

    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0,
      0,
      0
    );

    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59
    );

    // =========================
    // NAMA HARI
    // =========================

    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];

    const todayName = days[today.getDay()];

    // =========================
    // DATA DASHBOARD
    // =========================

    const [
      attendanceToday,
      totalAttendance,
      totalHadir,
      totalTerlambat,
      totalJournal,
      journals,
      announcements,
      schedules,
    ] = await Promise.all([
      // Absensi hari ini
      prisma.attendance.findFirst({
        where: {
          userId: id,
          tanggal: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        orderBy: {
          tanggal: "desc",
        },
      }),

      // Total seluruh absensi
      prisma.attendance.count({
        where: {
          userId: id,
        },
      }),

      // Total hadir
      prisma.attendance.count({
        where: {
          userId: id,
          status: "HADIR",
        },
      }),

      // Total terlambat
      prisma.attendance.count({
        where: {
          userId: id,
          status: "TERLAMBAT",
        },
      }),

      // Total jurnal
      prisma.journal.count({
        where: {
          userId: id,
        },
      }),

      // Jurnal terbaru
      prisma.journal.findMany({
        where: {
          userId: id,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 4,
      }),

      // Pengumuman terbaru
      prisma.announcement.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 4,
      }),

      // Semua jadwal siswa
      prisma.schedule.findMany({
        where: {
          userId: id,
        },
        orderBy: {
          id: "asc",
        },
      }),
    ]);

    // =========================
    // JADWAL HARI INI
    // =========================

    const todaySchedule = schedules.find(
      (item) => item.hari === todayName
    ) || null;

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json({
      data: {
        attendanceToday,

        totalAttendance,
        totalHadir,
        totalTerlambat,

        totalJournal,

        journals,
        announcements,

        schedules,

        todaySchedule,
      },
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);

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