import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// MENGAMBIL SEMUA PENGUMUMAN
export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil pengumuman",
      },
      {
        status: 500,
      }
    );
  }
}

// MEMBUAT PENGUMUMAN BARU
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { judul, isi } = body;

    if (!judul || !isi) {
      return NextResponse.json(
        {
          success: false,
          message: "Judul dan isi pengumuman wajib diisi",
        },
        {
          status: 400,
        }
      );
    }

    const announcement = await prisma.announcement.create({
      data: {
        judul,
        isi,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pengumuman berhasil dibuat",
      data: announcement,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal membuat pengumuman",
      },
      {
        status: 500,
      }
    );
  }
}

// MENGHAPUS PENGUMUMAN
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          message: "ID pengumuman tidak ditemukan",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.announcement.delete({
      where: {
        id: Number(id),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pengumuman berhasil dihapus",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus pengumuman",
      },
      {
        status: 500,
      }
    );
  }
}