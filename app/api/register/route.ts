import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      nama,
      username,
      password,
      nis,
      kelas,
      jurusan,
      tempatPkl,
    } = body;

    if (!nama || !username || !password) {
      return NextResponse.json(
        { message: "Nama, username, dan password wajib diisi." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Username sudah digunakan." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        nama,
        username,
        password: hashedPassword,
        nis: nis || null,
        kelas: kelas || null,
        jurusan: jurusan || null,
        tempatPkl: tempatPkl || null,
      },
    });

    return NextResponse.json(
      {
        message: "Pendaftaran berhasil.",
        userId: user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}