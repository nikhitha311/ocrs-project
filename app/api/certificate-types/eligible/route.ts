import { NextRequest, NextResponse } from "next/server";

const CERTIFICATE_TYPES = [
  { id: "bonafide", name: "Bonafide Certificate", fee: 0 },
  { id: "study_conduct", name: "Study & Conduct Certificate", fee: 200 },
  { id: "medium_instruction", name: "Medium of Instruction (English)", fee: 300 },
  { id: "course_completion", name: "Course Completion Certificate", fee: 0 },
  { id: "transfer_cert", name: "Transfer Certificate (TC)", fee: 100 },
  { id: "migration_cert", name: "Migration Certificate", fee: 150 },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rollNumber = searchParams.get("rollNumber") || "24881A12A1";

  // Check demo requests in student portal
  const demoIssued = ["bonafide", "medium_instruction"];
  const demoActive = ["study_conduct"];

  const eligibleList = CERTIFICATE_TYPES.map((type) => {
    if (demoIssued.includes(type.id)) {
      return {
        id: type.id,
        name: type.name,
        fee: type.fee,
        eligible: false,
        reason: "already_issued",
      };
    }
    if (demoActive.includes(type.id)) {
      return {
        id: type.id,
        name: type.name,
        fee: type.fee,
        eligible: false,
        reason: "active_request",
      };
    }
    return {
      id: type.id,
      name: type.name,
      fee: type.fee,
      eligible: true,
      reason: null,
    };
  });

  return NextResponse.json(eligibleList);
}
