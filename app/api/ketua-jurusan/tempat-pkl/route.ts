import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {

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

    const tempatMap: Record<string, number> = {};

    students.forEach((student) => {

      if (student.tempatPkl) {

        if (tempatMap[student.tempatPkl]) {

          tempatMap[student.tempatPkl] += 1;

        } else {

          tempatMap[student.tempatPkl] = 1;

        }

      }

    });

    const data = Object.entries(tempatMap).map(
      ([nama, total]) => ({
        nama,
        total,
      })
    );

    return NextResponse.json({
      data,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        message: "Gagal mengambil data tempat PKL",
      },
      {
        status: 500,
      }
    );

  }
}