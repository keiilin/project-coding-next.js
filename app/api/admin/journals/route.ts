import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const userIdParam = searchParams.get("userId");

    // Jika userId dikirim, validasi bahwa user tersebut ADMIN
    if (userIdParam) {
      const userId = Number(userIdParam);

      if (!userId || Number.isNaN(userId)) {
        return NextResponse.json(
          {
            message: "User ID tidak valid.",
          },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          role: true,
        },
      });

      if (!user) {
        return NextResponse.json(
          {
            message: "Data pengguna tidak ditemukan.",
          },
          { status: 404 }
        );
      }

      if (user.role !== "ADMIN") {
        return NextResponse.json(
          {
            message:
              "Akses hanya diperbolehkan untuk admin.",
          },
          { status: 403 }
        );
      }
    }

    const journals = await prisma.journal.findMany({
      orderBy: [
        {
          tanggal: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      select: {
        id: true,
        tanggal: true,
        kegiatan: true,
        kendala: true,
        createdAt: true,
        updatedAt: true,

        user: {
          select: {
            id: true,
            nama: true,
            username: true,
            nis: true,
            kelas: true,
            jurusan: true,
            tempatPkl: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Data jurnal berhasil diambil.",
      data: journals,
    });
  } catch (error) {
    console.error("ADMIN JOURNAL GET ERROR:", error);

    return NextResponse.json(
      {
        message: "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = Number(
      searchParams.get("userId")
    );

    const journalId = Number(
      searchParams.get("id")
    );

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json(
        {
          message: "User ID tidak valid.",
        },
        { status: 400 }
      );
    }

    if (!journalId || Number.isNaN(journalId)) {
      return NextResponse.json(
        {
          message: "ID jurnal tidak valid.",
        },
        { status: 400 }
      );
    }

    // Cek admin
    const admin = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        {
          message: "Data admin tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    if (admin.role !== "ADMIN") {
      return NextResponse.json(
        {
          message:
            "Akses hanya diperbolehkan untuk admin.",
        },
        { status: 403 }
      );
    }

    // Cek jurnal
    const journal = await prisma.journal.findUnique({
      where: {
        id: journalId,
      },
    });

    if (!journal) {
      return NextResponse.json(
        {
          message: "Jurnal tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    await prisma.journal.delete({
      where: {
        id: journalId,
      },
    });

    return NextResponse.json({
      message: "Jurnal berhasil dihapus.",
    });
  } catch (error) {
    console.error(
      "ADMIN JOURNAL DELETE ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Terjadi kesalahan saat menghapus jurnal.",
      },
      { status: 500 }
    );
  }
}