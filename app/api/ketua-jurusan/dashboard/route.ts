import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalStudents = await prisma.user.count({
      where: {
        role: "SISWA",
      },
    });

    const totalPembimbing = await prisma.user.count({
      where: {
        role: "PEMBIMBING",
      },
    });

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

    const students = await prisma.user.findMany({
      where: {
        role: "SISWA",
        tempatPkl: {
          not: null,
        },
      },

      select: {
        tempatPkl: true,
      },
    });

    const uniqueTempatPkl = new Set(
      students
        .map((student) => student.tempatPkl)
        .filter(Boolean)
    );

    const totalTempatPkl = uniqueTempatPkl.size;

    return NextResponse.json({
      data: {
        totalStudents,
        totalPembimbing,
        attendanceToday,
        totalTempatPkl,
      },
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Gagal mengambil dashboard ketua jurusan",
      },
      {
        status: 500,
      }
    );
  }
}