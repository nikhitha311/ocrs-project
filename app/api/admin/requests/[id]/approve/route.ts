import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const request = await prisma.request.findUnique({
      where: { id },
      include: { payment: true, type: true, student: true },
    });

    if (!request) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    // FEATURE 8: ADMIN PAYMENT GUARD
    if (request.type.fee > 0 && request.payment?.status !== "PAID") {
      return NextResponse.json(
        { error: "Payment not completed. Cannot issue certificate." },
        { status: 400 }
      );
    }

    // FEATURE 3: Generate Certificate Details
    const year = new Date().getFullYear();
    const ref = request.id.slice(-6).toUpperCase();
    const serialNo = `UNI/${year}/${ref}`;
    const qrToken = crypto.randomUUID();
    const sha256Hash = crypto
      .createHash("sha256")
      .update(`${serialNo}|${request.studentId}|${request.typeId}`)
      .digest("hex");

    // Insert Certificate row
    const certificate = await prisma.certificate.upsert({
      where: { requestId: request.id },
      update: {
        serialNo,
        qrToken,
        sha256Hash,
        issuedAt: new Date(),
      },
      create: {
        requestId: request.id,
        studentId: request.studentId,
        certTypeId: request.typeId,
        serialNo,
        qrToken,
        sha256Hash,
        issuedAt: new Date(),
      },
    });

    // Set Request.status = ISSUED
    await prisma.request.update({
      where: { id: request.id },
      data: {
        status: "ISSUED",
        serial: serialNo,
      },
    });

    // Insert Approval row
    await prisma.approval.create({
      data: {
        requestId: request.id,
        stage: "Issued",
        decision: "ISSUED",
        remarks: `Official digital certificate cryptographically signed & issued. Serial: ${serialNo}`,
      },
    });

    return NextResponse.json({
      ok: true,
      status: "ISSUED",
      serialNo,
      qrToken,
      certificateId: certificate.id,
    });
  } catch (error: any) {
    console.error("[Admin Approve Route Error]:", error);
    return NextResponse.json(
      { error: "Failed to approve request" },
      { status: 500 }
    );
  }
}
