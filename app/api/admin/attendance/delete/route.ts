import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    const attendanceId = Number(body.attendanceId);
    const adminId = Number(body.adminId);
    const reason = String(body.reason || "").trim();

    // =========================
    // VALIDASI
    // =========================

    if (!attendanceId || Number.isNaN(attendanceId)) {
      return NextResponse.json(
        {
          message: "ID absensi tidak valid.",
        },
        { status: 400 }
      );
    }

    if (!adminId || Number.isNaN(adminId)) {
      return NextResponse.json(
        {
          message: "ID admin tidak valid.",
        },
        { status: 400 }
      );
    }

    if (!reason) {
      return NextResponse.json(
        {
          message: "Alasan penghapusan wajib diisi.",
        },
        { status: 400 }
      );
    }

    // =========================
    // CEK ADMIN
    // =========================

    const admin = await prisma.user.findUnique({
      where: {
        id: adminId,
      },
    });

    if (!admin) {
      return NextResponse.json(
        {
          message: "Admin tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    if (admin.role !== "ADMIN") {
      return NextResponse.json(
        {
          message:
            "Akses ditolak. Hanya admin yang dapat menghapus absensi.",
        },
        { status: 403 }
      );
    }

    // =========================
    // CARI ABSENSI
    // =========================

    const attendance =
      await prisma.attendance.findUnique({
        where: {
          id: attendanceId,
        },
      });

    if (!attendance) {
      return NextResponse.json(
        {
          message: "Data absensi tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    // =========================
    // SIMPAN KE HISTORY
    // SEBELUM DIHAPUS
    // =========================

    await prisma.$transaction(async (tx) => {
      await tx.attendanceHistory.create({
        data: {
          attendanceId: attendance.id,

          userId: attendance.userId,

          adminId: admin.id,

          action: "DIHAPUS",

          reason: reason,

          tanggal: attendance.tanggal,

          jamMasuk: attendance.jamMasuk,

          jamPulang: attendance.jamPulang,

          status: attendance.status,

          alasanTerlambat:
            attendance.alasanTerlambat,

          alasanPulangTelat:
            attendance.alasanPulangTelat,

          fotoMasuk:
            attendance.fotoMasuk,

          fotoPulang:
            attendance.fotoPulang,
        },
      });

      // =========================
      // HAPUS DATA AKTIF
      // =========================

      await tx.attendance.delete({
        where: {
          id: attendance.id,
        },
      });
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Absensi berhasil dihapus dan salinannya disimpan ke histori.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "DELETE ATTENDANCE ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Terjadi kesalahan saat menghapus data absensi.",
      },
      { status: 500 }
    );
  }
}