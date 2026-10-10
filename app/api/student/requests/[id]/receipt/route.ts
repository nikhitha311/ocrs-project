import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateReceiptPdf } from "@/lib/receipt";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        type: true,
        student: true,
        payment: true,
      },
    });

    if (!request) {
      return NextResponse.json(
        { error: "Request record not found" },
        { status: 404 }
      );
    }

    if (!request.payment || request.payment.status !== "PAID") {
      return NextResponse.json(
        { error: "Payment not completed. Receipt unavailable." },
        { status: 400 }
      );
    }

    const receiptNo =
      request.payment.receiptNo ||
      `RCPT/${new Date().getFullYear()}/${request.id.slice(-6).toUpperCase()}`;

    const pdfBuffer = await generateReceiptPdf({
      receiptNo,
      studentName: request.student?.name || "Student",
      rollNo: request.student?.rollNo || "24881A12A1",
      department: request.student?.department || "Information Technology (IT)",
      certType: request.type.name,
      amount: request.payment.amount,
      method: request.payment.method,
      upiTxnId: request.payment.upiTxnId,
      paidAt: request.payment.paidAt || request.payment.createdAt,
      universityName: process.env.UPI_NAME || "UNIVERSITY OF TECHNOLOGY",
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${receiptNo}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("[Receipt Download Error]:", error);
    return NextResponse.json(
      { error: "Failed to generate receipt PDF" },
      { status: 500 }
    );
  }
}
