import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import fs from "fs/promises";

import path from "path";

export async function POST(request: Request) {
  try {
    // =========================
    // BACA FORM DATA
    // =========================

    const formData = await request.formData();

    const userId = Number(formData.get("userId"));

    const alasanPulangTelat =
      String(
        formData.get("alasanPulangTelat") || ""
      ).trim() || null;

    const foto = formData.get("foto");

    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json(
        {
          message: "User ID tidak valid",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // VALIDASI FOTO
    // =========================

    if (
      foto &&
      foto instanceof File &&
      foto.size > 0
    ) {
      if (!foto.type.startsWith("image/")) {
        return NextResponse.json(
          {
            message:
              "File yang dikirim harus berupa gambar.",
          },
          {
            status: 400,
          }
        );
      }

      // Maksimal 5 MB
      if (foto.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          {
            message:
              "Ukuran foto maksimal 5 MB.",
          },
          {
            status: 400,
          }
        );
      }
    }

    const now = new Date();

    // =========================
    // BATAS HARI INI
    // =========================

    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0
    );

    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59
    );

    // =========================
    // CARI ABSENSI HARI INI
    // =========================

    const attendance =
      await prisma.attendance.findFirst({
        where: {
          userId,
          tanggal: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        orderBy: {
          tanggal: "desc",
        },
      });

    if (!attendance) {
      return NextResponse.json(
        {
          message:
            "Kamu belum melakukan absensi masuk.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // CEK SUDAH PULANG
    // =========================

    if (attendance.jamPulang) {
      return NextResponse.json(
        {
          message:
            "Kamu sudah melakukan absensi pulang hari ini.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // CARI JADWAL HARI INI
    // =========================

    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];

    const todayName =
      days[now.getDay()];

    const schedule =
      await prisma.schedule.findFirst({
        where: {
          userId,
          hari: todayName,
        },
      });

    // =========================
    // CEK JAM PULANG
    // =========================

    let pulangTelat = false;

    // Jika jadwal hari ini tidak ditemukan,
    // jangan izinkan absen pulang.
    if (!schedule) {
      return NextResponse.json(
        {
          message:
            "Jadwal PKL hari ini belum tersedia. Absen pulang tidak dapat dilakukan.",
        },
        {
          status: 400,
        }
      );
    }

    // Ambil jam pulang dari jadwal
    const [hour, minute] =
      schedule.jamPulang
        .split(":")
        .map(Number);

    const scheduleTime =
      new Date(now);

    scheduleTime.setHours(
      hour,
      minute,
      0,
      0
    );

    // =========================================
    // BELUM BOLEH ABSEN PULANG
    // =========================================

    if (now < scheduleTime) {
      return NextResponse.json(
        {
          message: `Belum waktunya absen pulang. Jadwal pulang kamu pukul ${schedule.jamPulang}.`,
          jamPulang: schedule.jamPulang,
        },
        {
          status: 400,
        }
      );
    }

    // =========================================
    // SUDAH MELEWATI JADWAL PULANG
    // =========================================

    if (now > scheduleTime) {
      pulangTelat = true;
    }

    // =========================
    // VALIDASI ALASAN
    // PULANG TELAT
    // =========================

    if (
      pulangTelat &&
      !alasanPulangTelat
    ) {
      return NextResponse.json(
        {
          message:
            "Kamu pulang melewati jadwal. Silakan masukkan alasan.",
          perluAlasan: true,
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // SIMPAN FOTO
    // =========================

    let fotoPulang: string | null =
      null;

    if (
      foto &&
      foto instanceof File &&
      foto.size > 0
    ) {
      const bytes =
        await foto.arrayBuffer();

      const buffer =
        Buffer.from(bytes);

      const uploadDir =
        path.join(
          process.cwd(),
          "public",
          "uploads",
          "attendance"
        );

      await fs.mkdir(
        uploadDir,
        {
          recursive: true,
        }
      );

      const extension =
        foto.name.split(".").pop() ||
        "jpg";

      const fileName =
        `pulang-${userId}-${Date.now()}.${extension}`;

      const filePath =
        path.join(
          uploadDir,
          fileName
        );

      await fs.writeFile(
        filePath,
        buffer
      );

      fotoPulang =
        `/uploads/attendance/${fileName}`;
    }

    // =========================
    // UPDATE ABSENSI
    // =========================

    const updatedAttendance =
      await prisma.attendance.update({
        where: {
          id: attendance.id,
        },

        data: {
          jamPulang: now,

          alasanPulangTelat:
            pulangTelat
              ? alasanPulangTelat
              : null,

          fotoPulang,
        },
      });

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json({
      message: pulangTelat
        ? "Absensi pulang berhasil. Kamu tercatat pulang melewati jadwal."
        : "Absensi pulang berhasil.",

      data: updatedAttendance,
    });
  } catch (error) {
    console.error(
      "CHECK-OUT ERROR:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Terjadi kesalahan server.",
      },
      {
        status: 500,
      }
    );
  }
}