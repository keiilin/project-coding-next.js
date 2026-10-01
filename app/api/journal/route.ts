import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ==============================
// GET - AMBIL JURNAL SISWA
// ==============================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = Number(searchParams.get("userId"));

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json(
        { message: "User ID tidak valid." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Data siswa tidak ditemukan." },
        { status: 404 }
      );
    }

    if (user.role !== "SISWA") {
      return NextResponse.json(
        { message: "Akses hanya diperbolehkan untuk siswa." },
        { status: 403 }
      );
    }

    const journals = await prisma.journal.findMany({
      where: { userId },
      orderBy: { tanggal: "desc" },
      select: {
        id: true,
        tanggal: true,
        kegiatan: true,
        kendala: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: "Data jurnal berhasil diambil.",
      data: journals,
    });
  } catch (error) {
    console.error("GET JOURNAL ERROR:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

// ==============================
// POST - TAMBAH JURNAL
// ==============================
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const userId = Number(body.userId);
    const kegiatan = String(body.kegiatan || "").trim();
    const kendala = String(body.kendala || "").trim();

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json(
        { message: "User ID tidak valid." },
        { status: 400 }
      );
    }

    if (!kegiatan) {
      return NextResponse.json(
        { message: "Kegiatan PKL wajib diisi." },
        { status: 400 }
      );
    }

    if (kegiatan.length < 5) {
      return NextResponse.json(
        { message: "Kegiatan PKL minimal 5 karakter." },
        { status: 400 }
      );
    }

    if (kegiatan.length > 2000) {
      return NextResponse.json(
        { message: "Kegiatan PKL maksimal 2000 karakter." },
        { status: 400 }
      );
    }

    if (kendala.length > 2000) {
      return NextResponse.json(
        { message: "Kendala maksimal 2000 karakter." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Data siswa tidak ditemukan." },
        { status: 404 }
      );
    }

    if (user.role !== "SISWA") {
      return NextResponse.json(
        { message: "Akses hanya diperbolehkan untuk siswa." },
        { status: 403 }
      );
    }

    const journal = await prisma.journal.create({
      data: {
        userId,
        kegiatan,
        kendala: kendala || null,
      },
      select: {
        id: true,
        tanggal: true,
        kegiatan: true,
        kendala: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Jurnal PKL berhasil ditambahkan.",
        data: journal,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE JOURNAL ERROR:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

// ==============================
// PUT - EDIT JURNAL
// ==============================
export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const userId = Number(body.userId);
    const journalId = Number(body.id);

    const kegiatan = String(body.kegiatan || "").trim();
    const kendala = String(body.kendala || "").trim();

    if (
      !userId ||
      Number.isNaN(userId) ||
      !journalId ||
      Number.isNaN(journalId)
    ) {
      return NextResponse.json(
        { message: "User ID atau ID jurnal tidak valid." },
        { status: 400 }
      );
    }

    if (!kegiatan) {
      return NextResponse.json(
        { message: "Kegiatan PKL wajib diisi." },
        { status: 400 }
      );
    }

    if (kegiatan.length < 5) {
      return NextResponse.json(
        { message: "Kegiatan PKL minimal 5 karakter." },
        { status: 400 }
      );
    }

    if (kegiatan.length > 2000) {
      return NextResponse.json(
        { message: "Kegiatan PKL maksimal 2000 karakter." },
        { status: 400 }
      );
    }

    if (kendala.length > 2000) {
      return NextResponse.json(
        { message: "Kendala maksimal 2000 karakter." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Data siswa tidak ditemukan." },
        { status: 404 }
      );
    }

    if (user.role !== "SISWA") {
      return NextResponse.json(
        { message: "Akses hanya diperbolehkan untuk siswa." },
        { status: 403 }
      );
    }

    const journal = await prisma.journal.findUnique({
      where: { id: journalId },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!journal) {
      return NextResponse.json(
        { message: "Jurnal tidak ditemukan." },
        { status: 404 }
      );
    }

    if (journal.userId !== userId) {
      return NextResponse.json(
        { message: "Kamu tidak dapat mengubah jurnal milik siswa lain." },
        { status: 403 }
      );
    }

    const updatedJournal = await prisma.journal.update({
      where: { id: journalId },
      data: {
        kegiatan,
        kendala: kendala || null,
      },
      select: {
        id: true,
        tanggal: true,
        kegiatan: true,
        kendala: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Jurnal PKL berhasil diperbarui.",
        data: updatedJournal,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("UPDATE JOURNAL ERROR:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

// ==============================
// DELETE - HAPUS JURNAL
// ==============================
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const userId = Number(searchParams.get("userId"));
    const journalId = Number(searchParams.get("id"));

    if (
      !userId ||
      Number.isNaN(userId) ||
      !journalId ||
      Number.isNaN(journalId)
    ) {
      return NextResponse.json(
        { message: "User ID atau ID jurnal tidak valid." },
        { status: 400 }
      );
    }

    const journal = await prisma.journal.findUnique({
      where: { id: journalId },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!journal) {
      return NextResponse.json(
        { message: "Jurnal tidak ditemukan." },
        { status: 404 }
      );
    }

    if (journal.userId !== userId) {
      return NextResponse.json(
        {
          message:
            "Kamu tidak dapat menghapus jurnal milik siswa lain.",
        },
        { status: 403 }
      );
    }

    await prisma.journal.delete({
      where: { id: journalId },
    });

    return NextResponse.json({
      message: "Jurnal berhasil dihapus.",
    });
  } catch (error) {
    console.error("DELETE JOURNAL ERROR:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}