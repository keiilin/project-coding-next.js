import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// =========================
// UPDATE USER
// =========================

export async function PUT(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;
    const userId = Number(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        {
          message: "ID user tidak valid",
        },
        {
          status: 400,
        }
      );
    }

    const body = await request.json();

    const {
      nama,
      username,
      password,
      role,
      nis,
      kelas,
      jurusan,
      tempatPkl,
    } = body;

    // =========================
    // VALIDASI
    // =========================

    if (!nama || !username || !role) {
      return NextResponse.json(
        {
          message: "Nama, username, dan role wajib diisi",
        },
        {
          status: 400,
        }
      );
    }

    const allowedRoles = [
      "ADMIN",
      "SISWA",
      "PEMBIMBING",
      "KETUA_JURUSAN",
    ];

    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        {
          message: "Role tidak valid",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // CEK USER
    // =========================

    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          message: "User tidak ditemukan",
        },
        {
          status: 404,
        }
      );
    }

    // =========================
    // CEK USERNAME
    // =========================

    const usernameOwner = await prisma.user.findFirst({
      where: {
        username,
        NOT: {
          id: userId,
        },
      },
    });

    if (usernameOwner) {
      return NextResponse.json(
        {
          message: "Username sudah digunakan user lain",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // CEK NIS
    // =========================

    if (nis) {
      const nisOwner = await prisma.user.findFirst({
        where: {
          nis,
          NOT: {
            id: userId,
          },
        },
      });

      if (nisOwner) {
        return NextResponse.json(
          {
            message: "NIS sudah digunakan user lain",
          },
          {
            status: 400,
          }
        );
      }
    }

    // =========================
    // DATA UPDATE
    // =========================

    const updateData: any = {
      nama,
      username,
      role,

      nis: nis || null,
      kelas: kelas || null,
      jurusan: jurusan || null,
      tempatPkl: tempatPkl || null,
    };

    // =========================
    // PASSWORD
    // =========================

    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(
        password,
        10
      );
    }

    // =========================
    // UPDATE DATABASE
    // =========================

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },

      data: updateData,

      select: {
        id: true,
        nama: true,
        username: true,
        role: true,
        nis: true,
        kelas: true,
        jurusan: true,
        tempatPkl: true,
      },
    });

    return NextResponse.json({
      message: "User berhasil diperbarui",
      data: updatedUser,
    });
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);

    return NextResponse.json(
      {
        message: "Gagal memperbarui user",
      },
      {
        status: 500,
      }
    );
  }
}

// =========================
// DELETE USER
// =========================

export async function DELETE(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;
    const userId = Number(id);

    if (isNaN(userId)) {
      return NextResponse.json(
        {
          message: "ID user tidak valid",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // CEK USER
    // =========================

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "User tidak ditemukan",
        },
        {
          status: 404,
        }
      );
    }

    // =========================
    // CEK DATA TERKAIT
    // =========================

    const attendanceCount =
      await prisma.attendance.count({
        where: {
          userId,
        },
      });

    const journalCount =
      await prisma.journal.count({
        where: {
          userId,
        },
      });

    const scheduleCount =
      await prisma.schedule.count({
        where: {
          userId,
        },
      });

    if (
      attendanceCount > 0 ||
      journalCount > 0 ||
      scheduleCount > 0
    ) {
      return NextResponse.json(
        {
          message:
            "User tidak dapat dihapus karena masih memiliki data absensi, jurnal, atau jadwal.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // DELETE
    // =========================

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return NextResponse.json({
      message: "User berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);

    return NextResponse.json(
      {
        message: "Gagal menghapus user",
      },
      {
        status: 500,
      }
    );
  }
}