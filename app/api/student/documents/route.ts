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

  // Ensure default academic documents exist
  const docNames = [
    { name: "10th Marksheet", status: "VERIFIED" },
    { name: "12th Marksheet", status: "VERIFIED" },
    { name: "Aadhaar/ID", status: "VERIFIED" },
    { name: "Transfer Cert", status: "PENDING" },
  ];

  for (const d of docNames) {
    const existing = await prisma.academicDocument.findFirst({
      where: { studentId: student.id, name: d.name },
    });
    if (!existing) {
      await prisma.academicDocument.create({
        data: {
          studentId: student.id,
          name: d.name,
          status: d.status,
          uploadedAt: d.status === "VERIFIED" ? new Date() : null,
        },
      });
    }
  }

  return student;
}

export async function GET(req: NextRequest) {
  try {
    const student = await getOrCreateStudent();

    const academicDocs = await prisma.academicDocument.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: "asc" },
    });

    const certificates = await prisma.certificate.findMany({
      where: { studentId: student.id },
      include: {
        certType: true,
        request: {
          include: {
            payment: true,
          },
        },
      },
      orderBy: { issuedAt: "desc" },
    });

    const issued = certificates.map((cert) => {
      const isPaid = cert.request.payment?.status === "PAID";
      return {
        type: cert.certType.name,
        serial: cert.serialNo,
        issuedAt: cert.issuedAt,
        qrToken: cert.qrToken,
        receiptNo: isPaid ? cert.request.payment?.receiptNo : null,
        amount: cert.request.payment?.amount || 0,
        requestId: cert.requestId,
      };
    });

    return NextResponse.json({
      academic: academicDocs.map((doc) => ({
        id: doc.id,
        name: doc.name,
        status: doc.status,
        fileUrl: doc.fileUrl,
        uploadedAt: doc.uploadedAt,
      })),
      issued,
    });
  } catch (error: any) {
    console.error("[Documents GET Error]:", error);
    return NextResponse.json(
      { error: "Failed to retrieve student documents" },
      { status: 500 }
    );
  }
}
