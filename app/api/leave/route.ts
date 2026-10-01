import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// =====================================================
// GET
// Mengambil daftar pengajuan izin milik siswa
// =====================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const userIdParam = searchParams.get("userId");

    if (!userIdParam) {
      return NextResponse.json(
        { message: "User ID diperlukan." },
        { status: 400 }
      );
    }

    const userId = Number(userIdParam);

    if (Number.isNaN(userId)) {
      return NextResponse.json(
        { message: "User ID tidak valid." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        nama: true,
        username: true,
        role: true,
        aktif: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User tidak ditemukan." },
        { status: 404 }
      );
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
      where: {
        userId,
      },
      orderBy: {
        tanggal: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: leaveRequests,
    });
  } catch (error) {
    console.error("GET LEAVE ERROR:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}

// =====================================================
// POST
// Membuat pengajuan izin / sakit
// =====================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const userId = Number(body.userId);
    const tanggal = String(body.tanggal || "").trim();
    const status = String(body.status || "").trim().toUpperCase();
    const alasan = String(body.alasan || "").trim();

    // ---------------------------------------------
    // Validasi userId
    // ---------------------------------------------
    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json(
        { message: "User ID tidak valid." },
        { status: 400 }
      );
    }

    // ---------------------------------------------
    // Validasi tanggal
    // ---------------------------------------------
    if (!tanggal) {
      return NextResponse.json(
        { message: "Tanggal izin wajib diisi." },
        { status: 400 }
      );
    }

    const tanggalIzin = new Date(`${tanggal}T00:00:00`);

    if (Number.isNaN(tanggalIzin.getTime())) {
      return NextResponse.json(
        { message: "Format tanggal tidak valid." },
        { status: 400 }
      );
    }

    // ---------------------------------------------
    // Validasi status
    // ---------------------------------------------
    if (!["IZIN", "SAKIT"].includes(status)) {
      return NextResponse.json(
        {
          message: "Jenis pengajuan harus IZIN atau SAKIT.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------
    // Validasi alasan
    // ---------------------------------------------
    if (!alasan) {
      return NextResponse.json(
        { message: "Alasan wajib diisi." },
        { status: 400 }
      );
    }

    if (alasan.length < 5) {
      return NextResponse.json(
        {
          message: "Alasan terlalu singkat. Silakan jelaskan lebih lengkap.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------
    // Cek user
    // ---------------------------------------------
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User tidak ditemukan." },
        { status: 404 }
      );
    }

    if (!user.aktif) {
      return NextResponse.json(
        { message: "Akun kamu sedang tidak aktif." },
        { status: 403 }
      );
    }

    if (user.role !== "SISWA") {
      return NextResponse.json(
        {
          message: "Hanya siswa yang dapat membuat pengajuan izin.",
        },
        { status: 403 }
      );
    }

    // ---------------------------------------------
    // Cek apakah sudah ada pengajuan pada tanggal
    // yang sama
    // ---------------------------------------------
    const startOfDay = new Date(tanggalIzin);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(tanggalIzin);
    endOfDay.setHours(23, 59, 59, 999);

    const existingLeave = await prisma.leaveRequest.findFirst({
      where: {
        userId,
        tanggal: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (existingLeave) {
      return NextResponse.json(
        {
          message:
            "Kamu sudah memiliki pengajuan izin pada tanggal tersebut.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------
    // Cek apakah sudah ada absensi pada tanggal
    // tersebut
    // ---------------------------------------------
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId,
        tanggal: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (existingAttendance) {
      return NextResponse.json(
        {
          message:
            "Pada tanggal tersebut sudah terdapat data absensi sehingga pengajuan izin tidak dapat dibuat.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------
    // Buat pengajuan
    // ---------------------------------------------
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        userId,
        tanggal: tanggalIzin,
        status,
        alasan,
        statusPengajuan: "MENUNGGU",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Pengajuan izin berhasil dikirim dan sedang menunggu persetujuan admin.",
        data: leaveRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST LEAVE ERROR:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE
// Menghapus pengajuan yang masih MENUNGGU
// =====================================================
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const idParam = searchParams.get("id");
    const userIdParam = searchParams.get("userId");

    if (!idParam || !userIdParam) {
      return NextResponse.json(
        {
          message: "ID pengajuan dan User ID diperlukan.",
        },
        { status: 400 }
      );
    }

    const id = Number(idParam);
    const userId = Number(userIdParam);

    if (Number.isNaN(id) || Number.isNaN(userId)) {
      return NextResponse.json(
        {
          message: "ID pengajuan atau User ID tidak valid.",
        },
        { status: 400 }
      );
    }

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: {
        id,
      },
    });

    if (!leaveRequest) {
      return NextResponse.json(
        {
          message: "Pengajuan izin tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    // Pastikan pengajuan memang milik siswa tersebut
    if (leaveRequest.userId !== userId) {
      return NextResponse.json(
        {
          message: "Kamu tidak memiliki akses ke pengajuan ini.",
        },
        { status: 403 }
      );
    }

    // Pengajuan yang sudah diproses tidak boleh dihapus siswa
    if (leaveRequest.statusPengajuan !== "MENUNGGU") {
      return NextResponse.json(
        {
          message:
            "Pengajuan yang sudah diproses tidak dapat dihapus.",
        },
        { status: 400 }
      );
    }

    await prisma.leaveRequest.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pengajuan izin berhasil dibatalkan.",
    });
  } catch (error) {
    console.error("DELETE LEAVE ERROR:", error);

    return NextResponse.json(
      {
        message: "Terjadi kesalahan server.",
      },
      { status: 500 }
    );
  }
}