import { NextResponse } from "next/server";
import { getAgent } from "@/lib/agents";
import { agentReply } from "@/lib/chat";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  let body: any = {};
  try { body = await request.json(); } catch { body = {}; }
  const agent = getAgent(String(body?.agentId || "visa"));
  const history = Array.isArray(body?.messages)
    ? body.messages
        .filter((m: any) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
        .map((m: any) => ({ role: m.role, content: String(m.content).slice(0, 4000) }))
    : [];
  if (!history.length) return NextResponse.json({ ok: false, error: "No messages" }, { status: 400 });
  const out = await agentReply(agent.system, history);
  return NextResponse.json({ ok: true, agent: agent.id, ...out });
}
