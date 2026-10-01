import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(request: NextRequest) {
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


    const schedules = await prisma.schedule.findMany({
      where: {
        userId: Number(userId),
      },

      orderBy: {
        id: "asc",
      },
    });


    return NextResponse.json({
      data: schedules,
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


export async function POST(request: NextRequest) {
  try {

    const body = await request.json();

    const {
      userId,
      hari,
      jamMasuk,
      jamPulang,
    } = body;


    if (
      !userId ||
      !hari ||
      !jamMasuk ||
      !jamPulang
    ) {

      return NextResponse.json(
        {
          message:
            "Semua data jadwal wajib diisi",
        },
        {
          status: 400,
        }
      );

    }


    // Cek apakah hari sudah memiliki jadwal

    const existingSchedule =
      await prisma.schedule.findFirst({
        where: {
          userId: Number(userId),
          hari,
        },
      });


    if (existingSchedule) {

      return NextResponse.json(
        {
          message:
            `Jadwal untuk hari ${hari} sudah ada`,
        },
        {
          status: 400,
        }
      );

    }


    const schedule =
      await prisma.schedule.create({

        data: {
          userId: Number(userId),
          hari,
          jamMasuk,
          jamPulang,
        },

      });


    return NextResponse.json(
      {
        message:
          "Jadwal berhasil disimpan",

        data: schedule,
      },
      {
        status: 201,
      }
    );

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        message:
          "Terjadi kesalahan server",
      },
      {
        status: 500,
      }
    );

  }
}


export async function DELETE(request: NextRequest) {
  try {

    const { searchParams } =
      new URL(request.url);

    const id = searchParams.get("id");


    if (!id) {

      return NextResponse.json(
        {
          message:
            "ID jadwal diperlukan",
        },
        {
          status: 400,
        }
      );

    }


    await prisma.schedule.delete({

      where: {
        id: Number(id),
      },

    });


    return NextResponse.json({
      message:
        "Jadwal berhasil dihapus",
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        message:
          "Gagal menghapus jadwal",
      },
      {
        status: 500,
      }
    );

  }
}