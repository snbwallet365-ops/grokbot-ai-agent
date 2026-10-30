import { NextResponse } from "next/server";
import { generatePlan } from "@/lib/mistral";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let prompt = "";
  try {
    const body = await request.json();
    prompt = typeof body?.prompt === "string" ? body.prompt : "";
  } catch {
    prompt = "";
  }
  const plan = await generatePlan(prompt || "Plan a tourist visa application workflow.");
  return NextResponse.json({ ok: true, ...plan });
}

export async function GET() {
  const plan = await generatePlan("Plan a tourist visa application workflow.");
  return NextResponse.json({ ok: true, ...plan });
}
