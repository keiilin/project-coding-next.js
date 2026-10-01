import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");

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

    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
      select: {
        id: true,
        nama: true,
        username: true,
        role: true,
        nis: true,
        kelas: true,
        jurusan: true,
        tempatPkl: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "User tidak ditemukan",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      message: "Data profil berhasil diambil",
      data: user,
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


export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      userId,
      nama,
      kelas,
      jurusan,
      tempatPkl,
    } = body;

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

    const user = await prisma.user.update({
      where: {
        id: Number(userId),
      },
      data: {
        nama,
        kelas,
        jurusan,
        tempatPkl,
      },
    });

    return NextResponse.json({
      message: "Profil berhasil diperbarui",
      data: user,
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