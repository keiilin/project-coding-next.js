import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = Number(searchParams.get("userId"));

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json(
        { message: "ID admin tidak valid." },
        { status: 400 }
      );
    }

    const admin = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nama: true,
        username: true,
        role: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { message: "Admin tidak ditemukan." },
        { status: 404 }
      );
    }

    if (admin.role !== "ADMIN") {
      return NextResponse.json(
        {
          message:
            "Akses ditolak. Hanya admin yang dapat melihat jadwal.",
        },
        { status: 403 }
      );
    }

    const schedules = await prisma.schedule.findMany({
      orderBy: [
        {
          userId: "asc",
        },
        {
          id: "asc",
        },
      ],
      include: {
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

    return NextResponse.json(
      {
        success: true,
        message: "Data jadwal berhasil diambil.",
        data: schedules,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET ADMIN SCHEDULE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data jadwal.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const adminId = Number(body.adminId);
    const userId = Number(body.userId);

    const hari = String(body.hari || "").trim();
    const jamMasuk = String(body.jamMasuk || "").trim();
    const jamPulang = String(body.jamPulang || "").trim();

    if (!adminId || Number.isNaN(adminId)) {
      return NextResponse.json(
        { message: "ID admin tidak valid." },
        { status: 400 }
      );
    }

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json(
        { message: "Siswa belum dipilih." },
        { status: 400 }
      );
    }

    if (!hari) {
      return NextResponse.json(
        { message: "Hari wajib dipilih." },
        { status: 400 }
      );
    }

    if (!jamMasuk) {
      return NextResponse.json(
        { message: "Jam masuk wajib diisi." },
        { status: 400 }
      );
    }

    if (!jamPulang) {
      return NextResponse.json(
        { message: "Jam pulang wajib diisi." },
        { status: 400 }
      );
    }

    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { message: "Admin tidak ditemukan." },
        { status: 404 }
      );
    }

    if (admin.role !== "ADMIN") {
      return NextResponse.json(
        {
          message:
            "Akses ditolak. Hanya admin yang dapat membuat jadwal.",
        },
        { status: 403 }
      );
    }

    const student = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nama: true,
        role: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { message: "Siswa tidak ditemukan." },
        { status: 404 }
      );
    }

    if (student.role !== "SISWA") {
      return NextResponse.json(
        { message: "Jadwal hanya dapat diberikan kepada akun siswa." },
        { status: 400 }
      );
    }

    const existingSchedule = await prisma.schedule.findFirst({
      where: {
        userId,
        hari,
      },
    });

    if (existingSchedule) {
      return NextResponse.json(
        {
          message: `Jadwal untuk hari ${hari} pada siswa tersebut sudah ada.`,
        },
        { status: 409 }
      );
    }

    const schedule = await prisma.schedule.create({
      data: {
        userId,
        hari,
        jamMasuk,
        jamPulang,
      },
      include: {
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

    return NextResponse.json(
      {
        success: true,
        message: "Jadwal berhasil ditambahkan.",
        data: schedule,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE ADMIN SCHEDULE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menambahkan jadwal.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const adminId = Number(body.adminId);
    const scheduleId = Number(body.id);

    const hari = String(body.hari || "").trim();
    const jamMasuk = String(body.jamMasuk || "").trim();
    const jamPulang = String(body.jamPulang || "").trim();

    if (!adminId || Number.isNaN(adminId)) {
      return NextResponse.json(
        { message: "ID admin tidak valid." },
        { status: 400 }
      );
    }

    if (!scheduleId || Number.isNaN(scheduleId)) {
      return NextResponse.json(
        { message: "ID jadwal tidak valid." },
        { status: 400 }
      );
    }

    if (!hari || !jamMasuk || !jamPulang) {
      return NextResponse.json(
        { message: "Hari, jam masuk, dan jam pulang wajib diisi." },
        { status: 400 }
      );
    }

    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { message: "Admin tidak ditemukan." },
        { status: 404 }
      );
    }

    if (admin.role !== "ADMIN") {
      return NextResponse.json(
        {
          message:
            "Akses ditolak. Hanya admin yang dapat mengubah jadwal.",
        },
        { status: 403 }
      );
    }

    const existingSchedule = await prisma.schedule.findUnique({
      where: {
        id: scheduleId,
      },
    });

    if (!existingSchedule) {
      return NextResponse.json(
        { message: "Jadwal tidak ditemukan." },
        { status: 404 }
      );
    }

    const duplicateSchedule = await prisma.schedule.findFirst({
      where: {
        userId: existingSchedule.userId,
        hari,
        NOT: {
          id: scheduleId,
        },
      },
    });

    if (duplicateSchedule) {
      return NextResponse.json(
        {
          message: `Jadwal untuk hari ${hari} pada siswa tersebut sudah ada.`,
        },
        { status: 409 }
      );
    }

    const updatedSchedule = await prisma.schedule.update({
      where: {
        id: scheduleId,
      },
      data: {
        hari,
        jamMasuk,
        jamPulang,
      },
      include: {
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

    return NextResponse.json(
      {
        success: true,
        message: "Jadwal berhasil diubah.",
        data: updatedSchedule,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("UPDATE ADMIN SCHEDULE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengubah jadwal.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const adminId = Number(searchParams.get("adminId"));
    const scheduleId = Number(searchParams.get("id"));

    if (!adminId || Number.isNaN(adminId)) {
      return NextResponse.json(
        { message: "ID admin tidak valid." },
        { status: 400 }
      );
    }

    if (!scheduleId || Number.isNaN(scheduleId)) {
      return NextResponse.json(
        { message: "ID jadwal tidak valid." },
        { status: 400 }
      );
    }

    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!admin) {
      return NextResponse.json(
        { message: "Admin tidak ditemukan." },
        { status: 404 }
      );
    }

    if (admin.role !== "ADMIN") {
      return NextResponse.json(
        {
          message:
            "Akses ditolak. Hanya admin yang dapat menghapus jadwal.",
        },
        { status: 403 }
      );
    }

    const schedule = await prisma.schedule.findUnique({
      where: {
        id: scheduleId,
      },
    });

    if (!schedule) {
      return NextResponse.json(
        { message: "Jadwal tidak ditemukan." },
        { status: 404 }
      );
    }

    await prisma.schedule.delete({
      where: {
        id: scheduleId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Jadwal berhasil dihapus.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE ADMIN SCHEDULE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus jadwal.",
      },
      { status: 500 }
    );
  }
}