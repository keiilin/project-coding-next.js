import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// =====================================================
// Helper: cek apakah user adalah ADMIN
// =====================================================
async function validateAdmin(adminId: number) {
  if (!adminId || Number.isNaN(adminId)) {
    return {
      valid: false,
      message: "Admin ID tidak valid.",
    };
  }

  const admin = await prisma.user.findUnique({
    where: {
      id: adminId,
    },
    select: {
      id: true,
      nama: true,
      username: true,
      role: true,
      aktif: true,
    },
  });

  if (!admin) {
    return {
      valid: false,
      message: "Admin tidak ditemukan.",
    };
  }

  if (admin.role !== "ADMIN") {
    return {
      valid: false,
      message: "Akses ditolak. Hanya admin yang dapat mengakses menu ini.",
    };
  }

  if (!admin.aktif) {
    return {
      valid: false,
      message: "Akun admin sedang tidak aktif.",
    };
  }

  return {
    valid: true,
    admin,
  };
}

// =====================================================
// GET
// Mengambil seluruh pengajuan izin/sakit
// =====================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const adminIdParam = searchParams.get("adminId");
    const statusFilter = searchParams.get("status");

    const adminId = Number(adminIdParam);

    const adminCheck = await validateAdmin(adminId);

    if (!adminCheck.valid) {
      return NextResponse.json(
        {
          message: adminCheck.message,
        },
        { status: 403 }
      );
    }

    // ---------------------------------------------
    // Filter status jika diberikan
    // ---------------------------------------------
    const where: {
      statusPengajuan?: string;
    } = {};

    if (
      statusFilter &&
      ["MENUNGGU", "DITERIMA", "DITOLAK"].includes(
        statusFilter.toUpperCase()
      )
    ) {
      where.statusPengajuan = statusFilter.toUpperCase();
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
      where,

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
            aktif: true,
          },
        },
      },

      orderBy: [
        {
          statusPengajuan: "asc",
        },
        {
          tanggal: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    return NextResponse.json({
      success: true,
      data: leaveRequests,
    });
  } catch (error) {
    console.error("GET ADMIN LEAVE ERROR:", error);

    return NextResponse.json(
      {
        message: "Terjadi kesalahan server.",
      },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT
// Menerima / menolak pengajuan izin
//
// Body:
// {
//   adminId: number,
//   id: number,
//   keputusan: "DITERIMA" | "DITOLAK",
//   catatanAdmin?: string
// }
// =====================================================
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const adminId = Number(body.adminId);
    const id = Number(body.id);
    const keputusan = String(body.keputusan || "")
      .trim()
      .toUpperCase();

    const catatanAdmin =
      String(body.catatanAdmin || "").trim() || null;

    // ---------------------------------------------
    // Validasi admin
    // ---------------------------------------------
    const adminCheck = await validateAdmin(adminId);

    if (!adminCheck.valid) {
      return NextResponse.json(
        {
          message: adminCheck.message,
        },
        { status: 403 }
      );
    }

    // ---------------------------------------------
    // Validasi ID pengajuan
    // ---------------------------------------------
    if (!id || Number.isNaN(id)) {
      return NextResponse.json(
        {
          message: "ID pengajuan tidak valid.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------
    // Validasi keputusan
    // ---------------------------------------------
    if (!["DITERIMA", "DITOLAK"].includes(keputusan)) {
      return NextResponse.json(
        {
          message:
            "Keputusan harus DITERIMA atau DITOLAK.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------
    // Cari pengajuan
    // ---------------------------------------------
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: {
        id,
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
            aktif: true,
          },
        },
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

    // ---------------------------------------------
    // Pengajuan sudah diproses
    // ---------------------------------------------
    if (leaveRequest.statusPengajuan !== "MENUNGGU") {
      return NextResponse.json(
        {
          message:
            `Pengajuan ini sudah berstatus ${leaveRequest.statusPengajuan}.`,
        },
        { status: 400 }
      );
    }

    // =================================================
    // JIKA DITOLAK
    // =================================================
    if (keputusan === "DITOLAK") {
      const updatedLeave = await prisma.leaveRequest.update({
        where: {
          id,
        },

        data: {
          statusPengajuan: "DITOLAK",
          catatanAdmin,
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
              aktif: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Pengajuan izin berhasil ditolak.",
        data: updatedLeave,
      });
    }

    // =================================================
    // JIKA DITERIMA
    // =================================================

    const tanggalIzin = new Date(leaveRequest.tanggal);

    const startOfDay = new Date(tanggalIzin);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(tanggalIzin);
    endOfDay.setHours(23, 59, 59, 999);

    // ---------------------------------------------
    // Cek apakah sudah ada absensi
    // ---------------------------------------------
    const existingAttendance =
      await prisma.attendance.findFirst({
        where: {
          userId: leaveRequest.userId,
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
            "Pengajuan tidak dapat diterima karena sudah terdapat data absensi siswa pada tanggal tersebut.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------
    // Transaction:
    // 1. Update pengajuan
    // 2. Buat data absensi IZIN/SAKIT
    // ---------------------------------------------
    const result = await prisma.$transaction(
      async (tx) => {
        const updatedLeave =
          await tx.leaveRequest.update({
            where: {
              id,
            },

            data: {
              statusPengajuan: "DITERIMA",
              catatanAdmin,
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
                  aktif: true,
                },
              },
            },
          });

        const attendance =
          await tx.attendance.create({
            data: {
              userId: leaveRequest.userId,
              tanggal: tanggalIzin,
              status: leaveRequest.status,
            },
          });

        return {
          leaveRequest: updatedLeave,
          attendance,
        };
      }
    );

    return NextResponse.json({
      success: true,
      message:
        `Pengajuan ${leaveRequest.status} berhasil diterima dan otomatis dicatat pada absensi.`,
      data: result.leaveRequest,
      attendance: result.attendance,
    });
  } catch (error) {
    console.error("PUT ADMIN LEAVE ERROR:", error);

    return NextResponse.json(
      {
        message: "Terjadi kesalahan server.",
      },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE
// Menghapus pengajuan izin
// Hanya admin yang dapat menghapus
// =====================================================
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const adminIdParam = searchParams.get("adminId");
    const idParam = searchParams.get("id");

    const adminId = Number(adminIdParam);
    const id = Number(idParam);

    // ---------------------------------------------
    // Validasi admin
    // ---------------------------------------------
    const adminCheck = await validateAdmin(adminId);

    if (!adminCheck.valid) {
      return NextResponse.json(
        {
          message: adminCheck.message,
        },
        { status: 403 }
      );
    }

    // ---------------------------------------------
    // Validasi ID
    // ---------------------------------------------
    if (!id || Number.isNaN(id)) {
      return NextResponse.json(
        {
          message: "ID pengajuan tidak valid.",
        },
        { status: 400 }
      );
    }

    const leaveRequest =
      await prisma.leaveRequest.findUnique({
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

    await prisma.leaveRequest.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pengajuan izin berhasil dihapus.",
    });
  } catch (error) {
    console.error("DELETE ADMIN LEAVE ERROR:", error);

    return NextResponse.json(
      {
        message: "Terjadi kesalahan server.",
      },
      { status: 500 }
    );
  }
}