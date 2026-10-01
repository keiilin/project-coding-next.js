import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get("userId");

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
            message: "Data pengguna tidak ditemukan.",
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
    }

    const announcements =
      await prisma.announcement.findMany({
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          judul: true,
          isi: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    return NextResponse.json({
      message:
        "Data pengumuman berhasil diambil.",
      data: announcements,
    });
  } catch (error) {
    console.error(
      "ADMIN ANNOUNCEMENT GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Terjadi kesalahan pada server.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const userId = Number(body.userId);
    const judul = String(body.judul || "").trim();
    const isi = String(body.isi || "").trim();

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json(
        {
          message: "User ID tidak valid.",
        },
        { status: 400 }
      );
    }

    if (!judul) {
      return NextResponse.json(
        {
          message: "Judul pengumuman wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (judul.length < 3) {
      return NextResponse.json(
        {
          message:
            "Judul pengumuman minimal 3 karakter.",
        },
        { status: 400 }
      );
    }

    if (judul.length > 200) {
      return NextResponse.json(
        {
          message:
            "Judul pengumuman maksimal 200 karakter.",
        },
        { status: 400 }
      );
    }

    if (!isi) {
      return NextResponse.json(
        {
          message: "Isi pengumuman wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (isi.length < 5) {
      return NextResponse.json(
        {
          message:
            "Isi pengumuman minimal 5 karakter.",
        },
        { status: 400 }
      );
    }

    if (isi.length > 5000) {
      return NextResponse.json(
        {
          message:
            "Isi pengumuman maksimal 5000 karakter.",
        },
        { status: 400 }
      );
    }

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

    const announcement =
      await prisma.announcement.create({
        data: {
          judul,
          isi,
        },
        select: {
          id: true,
          judul: true,
          isi: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    return NextResponse.json(
      {
        message:
          "Pengumuman berhasil dibuat.",
        data: announcement,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "ADMIN ANNOUNCEMENT POST ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Terjadi kesalahan saat membuat pengumuman.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const userId = Number(body.userId);
    const announcementId = Number(body.id);

    const judul = String(body.judul || "").trim();
    const isi = String(body.isi || "").trim();

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json(
        {
          message: "User ID tidak valid.",
        },
        { status: 400 }
      );
    }

    if (
      !announcementId ||
      Number.isNaN(announcementId)
    ) {
      return NextResponse.json(
        {
          message:
            "ID pengumuman tidak valid.",
        },
        { status: 400 }
      );
    }

    if (!judul) {
      return NextResponse.json(
        {
          message:
            "Judul pengumuman wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (judul.length < 3) {
      return NextResponse.json(
        {
          message:
            "Judul pengumuman minimal 3 karakter.",
        },
        { status: 400 }
      );
    }

    if (judul.length > 200) {
      return NextResponse.json(
        {
          message:
            "Judul pengumuman maksimal 200 karakter.",
        },
        { status: 400 }
      );
    }

    if (!isi) {
      return NextResponse.json(
        {
          message:
            "Isi pengumuman wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (isi.length < 5) {
      return NextResponse.json(
        {
          message:
            "Isi pengumuman minimal 5 karakter.",
        },
        { status: 400 }
      );
    }

    if (isi.length > 5000) {
      return NextResponse.json(
        {
          message:
            "Isi pengumuman maksimal 5000 karakter.",
        },
        { status: 400 }
      );
    }

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

    const existing =
      await prisma.announcement.findUnique({
        where: {
          id: announcementId,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          message:
            "Pengumuman tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    const announcement =
      await prisma.announcement.update({
        where: {
          id: announcementId,
        },
        data: {
          judul,
          isi,
        },
        select: {
          id: true,
          judul: true,
          isi: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    return NextResponse.json({
      message:
        "Pengumuman berhasil diperbarui.",
      data: announcement,
    });
  } catch (error) {
    console.error(
      "ADMIN ANNOUNCEMENT PUT ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Terjadi kesalahan saat memperbarui pengumuman.",
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

    const announcementId = Number(
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

    if (
      !announcementId ||
      Number.isNaN(announcementId)
    ) {
      return NextResponse.json(
        {
          message:
            "ID pengumuman tidak valid.",
        },
        { status: 400 }
      );
    }

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

    const announcement =
      await prisma.announcement.findUnique({
        where: {
          id: announcementId,
        },
      });

    if (!announcement) {
      return NextResponse.json(
        {
          message:
            "Pengumuman tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    await prisma.announcement.delete({
      where: {
        id: announcementId,
      },
    });

    return NextResponse.json({
      message:
        "Pengumuman berhasil dihapus.",
    });
  } catch (error) {
    console.error(
      "ADMIN ANNOUNCEMENT DELETE ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Terjadi kesalahan saat menghapus pengumuman.",
      },
      { status: 500 }
    );
  }
}