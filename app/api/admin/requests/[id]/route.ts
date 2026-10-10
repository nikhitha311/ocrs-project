import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { status, remarks } = body;

    const request = await prisma.request.findUnique({
      where: { id },
      include: { payment: true, type: true, student: true },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // FEATURE 8: Admin Payment Guard
    if (status === "ISSUED" || status === "APPROVED") {
      if (request.type.fee > 0 && request.payment?.status !== "PAID") {
        return NextResponse.json(
          { error: "Payment not completed. Cannot issue certificate." },
          { status: 400 }
        );
      }
    }

    if (status === "ISSUED") {
      const year = new Date().getFullYear();
      const ref = request.id.slice(-6).toUpperCase();
      const serialNo = `UNI/${year}/${ref}`;
      const qrToken = crypto.randomUUID();
      const sha256Hash = crypto
        .createHash("sha256")
        .update(`${serialNo}|${request.studentId}|${request.typeId}`)
        .digest("hex");

      await prisma.certificate.upsert({
        where: { requestId: request.id },
        update: { serialNo, qrToken, sha256Hash, issuedAt: new Date() },
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

      await prisma.request.update({
        where: { id: request.id },
        data: { status: "ISSUED", serial: serialNo },
      });

      await prisma.approval.create({
        data: {
          requestId: request.id,
          stage: "Issued",
          decision: "ISSUED",
          remarks: remarks || `Certificate issued. Serial: ${serialNo}`,
        },
      });

      return NextResponse.json({ ok: true, status: "ISSUED", serialNo });
    }

    if (status === "REJECTED") {
      await prisma.request.update({
        where: { id: request.id },
        data: { status: "REJECTED" },
      });

      await prisma.approval.create({
        data: {
          requestId: request.id,
          stage: "Registrar Review",
          decision: "REJECTED",
          remarks: remarks || "Application rejected by registrar committee.",
        },
      });

      return NextResponse.json({ ok: true, status: "REJECTED" });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[Admin Update Error]:", error);
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    );
  }
}
