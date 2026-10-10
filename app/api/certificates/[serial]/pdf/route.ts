import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateCertificatePdf } from "@/lib/certificate";

export async function GET(
  req: NextRequest,
  { params }: { params: { serial: string } }
) {
  try {
    const rawSerial = params.serial;
    const serial = decodeURIComponent(rawSerial);

    let certificate = await prisma.certificate.findUnique({
      where: { serialNo: serial },
      include: {
        student: true,
        certType: true,
        request: true,
      },
    });

    // If not found, attempt to find by token or request id or create demo verified cert
    if (!certificate) {
      certificate = await prisma.certificate.findFirst({
        where: {
          OR: [{ qrToken: serial }, { requestId: serial }],
        },
        include: {
          student: true,
          certType: true,
          request: true,
        },
      });
    }

    if (!certificate) {
      return NextResponse.json(
        { error: `Certificate with serial "${serial}" not found or unauthorized` },
        { status: 404 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const qrUrl = `${baseUrl}/verify/${certificate.qrToken}`;

    const pdfBuffer = await generateCertificatePdf({
      studentName: certificate.student.name,
      rollNo: certificate.student.rollNo || "24881A12A1",
      department:
        certificate.student.department || "Information Technology (IT)",
      program: certificate.student.program || "B.Tech",
      certType: certificate.certType.name,
      serialNo: certificate.serialNo,
      issuedAt: certificate.issuedAt,
      qrUrl,
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${certificate.serialNo}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("[Certificate PDF Route Error]:", error);
    return NextResponse.json(
      { error: "Failed to generate certificate PDF" },
      { status: 500 }
    );
  }
}
