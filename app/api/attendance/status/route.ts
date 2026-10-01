import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const userId = Number(
      searchParams.get("userId")
    );

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json(
        {
          message: "User ID tidak valid",
        },
        {
          status: 400,
        }
      );
    }

    const now = new Date();

    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0
    );

    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59
    );

    const attendance =
      await prisma.attendance.findFirst({
        where: {
          userId,
          tanggal: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        orderBy: {
          tanggal: "desc",
        },
      });

    return NextResponse.json({
      data: attendance,
    });
  } catch (error) {
    console.error(
      "ATTENDANCE STATUS ERROR:",
      error
    );

    return NextResponse.json(
      {
        message: "Terjadi kesalahan server.",
      },
      {
        status: 500,
      }
    );
  }
}