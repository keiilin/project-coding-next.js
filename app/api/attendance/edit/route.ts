import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const attendanceId = Number(body.attendanceId);
    const adminId = Number(body.adminId);

    const reason = String(body.reason || "").trim();

    const status =
      body.status !== undefined
        ? String(body.status).trim()
        : undefined;

    const alasanTerlambat =
      body.alasanTerlambat !== undefined
        ? String(body.alasanTerlambat).trim() || null
        : undefined;

    const alasanPulangTelat =
      body.alasanPulangTelat !== undefined
        ? String(body.alasanPulangTelat).trim() || null
        : undefined;

    // =========================
    // VALIDASI ID ABSENSI
    // =========================

    if (!attendanceId || Number.isNaN(attendanceId)) {
      return NextResponse.json(
        {
          message: "ID absensi tidak valid.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // VALIDASI ID ADMIN
    // =========================

    if (!adminId || Number.isNaN(adminId)) {
      return NextResponse.json(
        {
          message: "ID admin tidak valid.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // VALIDASI ALASAN
    // =========================

    if (!reason) {
      return NextResponse.json(
        {
          message: "Alasan perubahan wajib diisi.",
        },
        {
          status: 400,
        }
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
        {
          status: 404,
        }
      );
    }

    if (admin.role !== "ADMIN") {
      return NextResponse.json(
        {
          message:
            "Akses ditolak. Hanya admin yang dapat mengubah absensi.",
        },
        {
          status: 403,
        }
      );
    }

    // =========================
    // CARI ABSENSI
    // =========================

    const attendance = await prisma.attendance.findUnique({
      where: {
        id: attendanceId,
      },
    });

    if (!attendance) {
      return NextResponse.json(
        {
          message: "Data absensi tidak ditemukan.",
        },
        {
          status: 404,
        }
      );
    }

    // =========================
    // PARSE JAM
    // =========================

    let jamMasuk: Date | null | undefined = undefined;
    let jamPulang: Date | null | undefined = undefined;

    if (body.jamMasuk !== undefined) {
      if (body.jamMasuk === null || body.jamMasuk === "") {
        jamMasuk = null;
      } else {
        const parsedJamMasuk = new Date(body.jamMasuk);

        if (Number.isNaN(parsedJamMasuk.getTime())) {
          return NextResponse.json(
            {
              message: "Format jam masuk tidak valid.",
            },
            {
              status: 400,
            }
          );
        }

        jamMasuk = parsedJamMasuk;
      }
    }

    if (body.jamPulang !== undefined) {
      if (body.jamPulang === null || body.jamPulang === "") {
        jamPulang = null;
      } else {
        const parsedJamPulang = new Date(body.jamPulang);

        if (Number.isNaN(parsedJamPulang.getTime())) {
          return NextResponse.json(
            {
              message: "Format jam pulang tidak valid.",
            },
            {
              status: 400,
            }
          );
        }

        jamPulang = parsedJamPulang;
      }
    }

    // =========================
    // SIMPAN HISTORI + UPDATE
    // =========================

    await prisma.$transaction(async (tx) => {
      // Simpan SNAPSHOT DATA LAMA
      await tx.attendanceHistory.create({
        data: {
          attendanceId: attendance.id,

          userId: attendance.userId,

          adminId: admin.id,

          action: "DIUBAH",

          reason: reason,

          tanggal: attendance.tanggal,

          jamMasuk: attendance.jamMasuk,

          jamPulang: attendance.jamPulang,

          status: attendance.status,

          alasanTerlambat: attendance.alasanTerlambat,

          alasanPulangTelat: attendance.alasanPulangTelat,

          fotoMasuk: attendance.fotoMasuk,

          fotoPulang: attendance.fotoPulang,
        },
      });

      // =========================
      // UPDATE ABSENSI
      // =========================

      await tx.attendance.update({
        where: {
          id: attendance.id,
        },

        data: {
          ...(jamMasuk !== undefined && {
            jamMasuk: jamMasuk,
          }),

          ...(jamPulang !== undefined && {
            jamPulang: jamPulang,
          }),

          ...(status !== undefined && {
            status: status,
          }),

          ...(alasanTerlambat !== undefined && {
            alasanTerlambat: alasanTerlambat,
          }),

          ...(alasanPulangTelat !== undefined && {
            alasanPulangTelat: alasanPulangTelat,
          }),
        },
      });
    });

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json(
      {
        success: true,

        message:
          "Data absensi berhasil diubah dan perubahan sebelumnya disimpan ke histori.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("EDIT ATTENDANCE ERROR:", error);

    return NextResponse.json(
      {
        message:
          "Terjadi kesalahan saat mengubah data absensi.",
      },
      {
        status: 500,
      }
    );
  }
}