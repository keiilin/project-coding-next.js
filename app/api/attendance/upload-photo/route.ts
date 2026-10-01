import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("photo") as File | null;

    if (!file) {
      return NextResponse.json(
        {
          message: "Foto tidak ditemukan",
        },
        {
          status: 400,
        }
      );
    }

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "attendance"
    );

    await mkdir(uploadDir, {
      recursive: true,
    });

    const fileName = `${Date.now()}-${file.name.replace(/\s/g, "-")}`;

    const filePath = path.join(
      uploadDir,
      fileName
    );

    await writeFile(
      filePath,
      buffer
    );

    return NextResponse.json({
      message: "Foto berhasil diupload",
      url: `/uploads/attendance/${fileName}`,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        message: "Terjadi kesalahan saat upload foto",
      },
      {
        status: 500,
      }
    );
  }
}