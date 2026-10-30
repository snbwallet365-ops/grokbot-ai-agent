import { NextResponse } from "next/server";
import { createRun, listRuns } from "@/lib/runs";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ runs: listRuns() });
}

export async function POST(request: Request) {
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const run = await createRun(body?.applicationId || "visa-demo", body?.prompt || "");
  return NextResponse.json({ ok: true, runId: run.id, run }, { status: 201 });
}
