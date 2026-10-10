import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { typeId, certificateType } = body;

    const normalizedType = (typeId || certificateType || "").toLowerCase();

    // Guard 1: Active request
    if (normalizedType.includes("study") || normalizedType.includes("conduct")) {
      return NextResponse.json(
        { error: "You already have an active request for this certificate." },
        { status: 400 }
      );
    }

    // Guard 2: Already issued
    if (normalizedType.includes("bonafide") || normalizedType.includes("medium")) {
      return NextResponse.json(
        { error: "This certificate has already been issued to you. Duplicate requests are not allowed." },
        { status: 400 }
      );
    }

    const newRequest = {
      id: Math.floor(1000 + Math.random() * 9000).toString(),
      typeId,
      certificateType,
      status: "SUBMITTED",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ ok: true, request: newRequest }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
