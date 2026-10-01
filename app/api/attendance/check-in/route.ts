import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const userId = Number(formData.get("userId"));
    const alasanTerlambat =
      String(formData.get("alasanTerlambat") || "").trim() || null;

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
            message: "File yang dikirim harus berupa gambar.",
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
            message: "Ukuran foto maksimal 5 MB.",
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
    // CEK ABSENSI HARI INI
    // =========================

    const existingAttendance =
      await prisma.attendance.findFirst({
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
            "Kamu sudah melakukan absensi masuk hari ini.",
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

    const todayName = days[now.getDay()];

    const schedule =
      await prisma.schedule.findFirst({
        where: {
          userId,
          hari: todayName,
        },
      });

    // =========================
    // TENTUKAN STATUS
    // =========================

    let status = "HADIR";

    if (schedule) {
      const [hour, minute] =
        schedule.jamMasuk
          .split(":")
          .map(Number);

      const scheduleTime = new Date(now);

      scheduleTime.setHours(
        hour,
        minute,
        0,
        0
      );

      if (now > scheduleTime) {
        status = "TERLAMBAT";
      }
    }

    // =========================
    // VALIDASI ALASAN
    // =========================

    if (
      status === "TERLAMBAT" &&
      !alasanTerlambat
    ) {
      return NextResponse.json(
        {
          message:
            "Kamu terlambat. Silakan masukkan alasan keterlambatan.",
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

    let fotoMasuk: string | null = null;

    if (
      foto &&
      foto instanceof File &&
      foto.size > 0
    ) {
      const bytes = await foto.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        "attendance"
      );

      await fs.mkdir(uploadDir, {
        recursive: true,
      });

      const extension =
        foto.name.split(".").pop() || "jpg";

      const fileName =
        `masuk-${userId}-${Date.now()}.${extension}`;

      const filePath = path.join(
        uploadDir,
        fileName
      );

      await fs.writeFile(
        filePath,
        buffer
      );

      fotoMasuk =
        `/uploads/attendance/${fileName}`;
    }

    // =========================
    // SIMPAN ABSENSI
    // =========================

    const attendance =
      await prisma.attendance.create({
        data: {
          userId,
          tanggal: now,
          jamMasuk: now,
          status,

          alasanTerlambat:
            status === "TERLAMBAT"
              ? alasanTerlambat
              : null,

          fotoMasuk,
        },
      });

    return NextResponse.json({
      message:
        status === "TERLAMBAT"
          ? "Absensi masuk berhasil. Kamu tercatat terlambat."
          : "Absensi masuk berhasil.",

      data: attendance,
    });
  } catch (error) {
    console.error(
      "CHECK-IN ERROR:",
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