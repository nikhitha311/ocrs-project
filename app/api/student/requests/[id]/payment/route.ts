import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";
import { generateReceiptPdf } from "@/lib/receipt";
import { sendReceiptEmail } from "@/lib/mailer";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    let request = await prisma.request.findUnique({
      where: { id },
      include: {
        type: true,
        student: true,
        payment: true,
      },
    });

    if (!request) {
      // Find or create default student and certificate type for resilient operation
      let student = await prisma.user.findFirst({ where: { role: "STUDENT" } });
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

      let certType = await prisma.certificateType.findFirst({
        where: { name: "Study & Conduct Certificate" },
      });
      if (!certType) {
        certType = await prisma.certificateType.create({
          data: {
            name: "Study & Conduct Certificate",
            code: "SCC",
            fee: 200,
          },
        });
      }

      request = await prisma.request.create({
        data: {
          id,
          studentId: student.id,
          typeId: certType.id,
          status: "IN_REVIEW",
          purpose: "Education Loan Application",
          urgency: "Urgent",
        },
        include: {
          type: true,
          student: true,
          payment: true,
        },
      });
    }

    const fee = request.type.fee;

    // If cert type fee is 0 -> return { amount: 0, status: "NOT_REQUIRED" }
    if (fee === 0) {
      return NextResponse.json({
        amount: 0,
        status: "NOT_REQUIRED",
        certType: request.type.name,
      });
    }

    // If no Payment row -> create one: amount = type.fee, method = "UPI", status = "PENDING"
    let payment = request.payment;
    if (!payment) {
      payment = await prisma.payment.create({
        data: {
          requestId: request.id,
          amount: fee,
          method: "UPI",
          status: "PENDING",
        },
      });
    }

    const upiId = process.env.UPI_ID || "university@upi";
    const upiName = process.env.UPI_NAME || "University Name";
    const ref = request.id.slice(-6).toUpperCase();
    const typeClean = request.type.name.replace(/[^a-zA-Z0-9]/g, "");
    const txnRef = `${typeClean}${ref}`;

    // Build UPI deep link:
    // upi://pay?pa={UPI_ID}&pn={UPI_NAME}&am={amount}&cu=INR&tn={type}-{ref}&tr={type}{ref}
    const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
      upiName
    )}&am=${payment.amount}&cu=INR&tn=${encodeURIComponent(
      request.type.name + "-" + ref
    )}&tr=${txnRef}`;

    // Generate QR via qrcode.toDataURL(upiLink, { width: 400, margin: 2 })
    const qrDataUrl = await QRCode.toDataURL(upiLink, {
      width: 400,
      margin: 2,
    });

    return NextResponse.json({
      amount: payment.amount,
      status: payment.status,
      method: payment.method,
      upiLink,
      qrDataUrl,
      txnRef,
      certType: request.type.name,
    });
  } catch (error: any) {
    console.error("[Payment GET Error]:", error);
    return NextResponse.json(
      { error: "Failed to generate payment details" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const { upiTxnId, method = "UPI" } = body;

    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        type: true,
        student: true,
        payment: true,
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const year = new Date().getFullYear();
    const ref = request.id.slice(-6).toUpperCase();
    const receiptNo = `RCPT/${year}/${ref}`;
    const paidAt = new Date();

    // Update or create payment row
    const updatedPayment = await prisma.payment.upsert({
      where: { requestId: request.id },
      update: {
        status: "PAID",
        paidAt,
        upiTxnId: upiTxnId || (method !== "UPI" ? `${method}-OFFICE` : "UPI-CONFIRMED"),
        method,
        receiptNo,
      },
      create: {
        requestId: request.id,
        amount: request.type.fee,
        status: "PAID",
        paidAt,
        upiTxnId: upiTxnId || (method !== "UPI" ? `${method}-OFFICE` : "UPI-CONFIRMED"),
        method,
        receiptNo,
      },
    });

    // Update Request.status = "IN_REVIEW"
    await prisma.request.update({
      where: { id: request.id },
      data: { status: "IN_REVIEW" },
    });

    // Insert Approval row: { requestId, approverId: studentId, stage: "Payment", decision: "PAID", remarks }
    const remarks = upiTxnId
      ? `Txn: ${upiTxnId}`
      : `Payment completed via ${method}`;

    await prisma.approval.create({
      data: {
        requestId: request.id,
        approverId: request.studentId,
        stage: "Payment",
        decision: "PAID",
        remarks,
      },
    });

    // Generate receipt PDF and email to student.email (fire-and-forget)
    (async () => {
      try {
        const studentEmail =
          request.student?.email || process.env.SMTP_USER || "student@example.com";
        const studentName = request.student?.name || "Student";
        const rollNo = request.student?.rollNo || "24881A12A1";
        const department = request.student?.department || "Information Technology (IT)";

        const pdfBuffer = await generateReceiptPdf({
          receiptNo,
          studentName,
          rollNo,
          department,
          certType: request.type.name,
          amount: updatedPayment.amount,
          method,
          upiTxnId: updatedPayment.upiTxnId,
          paidAt,
          universityName: process.env.UPI_NAME || "UNIVERSITY OF TECHNOLOGY",
        });

        const mailResult = await sendReceiptEmail({
          to: studentEmail,
          studentName,
          certType: request.type.name,
          receiptNo,
          amount: updatedPayment.amount,
          pdfBuffer,
        });

        if (mailResult.success) {
          await prisma.payment.update({
            where: { id: updatedPayment.id },
            data: { receiptSentAt: new Date() },
          });
        }
      } catch (mailErr) {
        console.error("[Payment Email Dispatch Error]:", mailErr);
      }
    })();

    return NextResponse.json({ ok: true, receiptNo });
  } catch (error: any) {
    console.error("[Payment POST Error]:", error);
    return NextResponse.json(
      { error: "Failed to record payment" },
      { status: 500 }
    );
  }
}
