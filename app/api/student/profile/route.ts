import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function getOrCreateStudent() {
  let student = await prisma.user.findFirst({
    where: { role: "STUDENT" },
  });

  if (!student) {
    student = await prisma.user.create({
      data: {
        name: "Nikhitha Mandhula",
        rollNo: "24881A12A1",
        email: "nikhithamandhula18@gmail.com",
        department: "Information Technology (IT)",
        program: "B.Tech",
        batch: "2024-2026",
        phone: "+91 98765 43210",
        role: "STUDENT",
      },
    });
  }

  return student;
}

export async function GET(req: NextRequest) {
  try {
    const student = await getOrCreateStudent();
    return NextResponse.json({
      name: student.name,
      rollNo: student.rollNo,
      department: student.department,
      program: student.program,
      batch: student.batch,
      email: student.email,
      phone: student.phone,
    });
  } catch (error: any) {
    console.error("[Profile GET Error]:", error);
    return NextResponse.json(
      { error: "Failed to retrieve student profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, phone } = body;

    const student = await getOrCreateStudent();

    const updated = await prisma.user.update({
      where: { id: student.id },
      data: {
        ...(email && { email }),
        ...(phone && { phone }),
      },
    });

    return NextResponse.json({
      ok: true,
      profile: {
        name: updated.name,
        rollNo: updated.rollNo,
        department: updated.department,
        program: updated.program,
        batch: updated.batch,
        email: updated.email,
        phone: updated.phone,
      },
    });
  } catch (error: any) {
    console.error("[Profile PATCH Error]:", error);
    return NextResponse.json(
      { error: "Failed to update profile information" },
      { status: 500 }
    );
  }
}
