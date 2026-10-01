import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {

    const journals = await prisma.journal.findMany({

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
        tanggal: "desc",
      },

    });

    return NextResponse.json({
      data: journals,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        message: "Gagal mengambil data jurnal",
      },
      {
        status: 500,
      }
    );

  }
}