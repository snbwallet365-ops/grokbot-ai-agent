import { getRun } from "@/lib/runs";

export const dynamic = "force-dynamic";

const FIELDS = [
  { name: "Full name", value: "Aisha Rahman" },
  { name: "Passport number", value: "P1234567" },
  { name: "Nationality", value: "Bangladesh" },
  { name: "Date of birth", value: "14 Mar 1994" },
  { name: "Email", value: "aisha.rahman@example.com" },
  { name: "Phone", value: "+880 1700 000000" },
  { name: "Arrival date", value: "12 Dec 2026" },
  { name: "Purpose of stay", value: "Tourism" }
];

function sse(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET(_request: Request, { params }: { params: { runId: string } }) {
  const run = await getRun(params.runId);
  const steps = run.steps.length ? run.steps : [];

  const stream = new ReadableStream({
    async start(controller) {
      const push = (event: string, data: unknown) => {
        try {
          controller.enqueue(new TextEncoder().encode(sse(event, data)));
        } catch {
          /* client went away */
        }
      };
      const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

      push("run_started", {
        runId: run.id,
        applicationId: run.applicationId,
        model: run.model,
        steps: steps.map((s) => s.title)
      });
      await wait(500);

      for (let i = 0; i < steps.length; i += 1) {
        const step = steps[i];
        push("thought", { index: i, note: step.title, detail: step.detail });
        await wait(420);
        push("tool_call", { index: i, tool: step.tool, args: { step: step.title } });
        await wait(520);

        if (step.tool === "profile.map" || step.tool === "form.fill") {
          const slice = step.tool === "form.fill" ? FIELDS.slice(3) : FIELDS.slice(0, 3);
          for (const field of slice) {
            push("field_fill", { name: field.name, value: field.value });
            await wait(230);
          }
        }

        if (step.tool === "docs.validate") {
          push("tool_result", { index: i, tool: step.tool, result: "Passport validity 2034-06-13 — 7 years remaining. Photo, itinerary and bank statement present." });
        } else if (step.tool === "browser.open") {
          push("tool_result", { index: i, tool: step.tool, result: "Portal session opened in an isolated browser context." });
        } else {
          push("tool_result", { index: i, tool: step.tool, result: "Step completed." });
        }
        await wait(380);
      }

      push("checkpoint", { note: "Form staged and evidence captured. Nothing has been submitted.", requireApproval: true });
      await wait(450);
      push("awaiting_user", { note: "Review the filled form, then approve to continue. Payment and final submission stay blocked until you approve." });
      await wait(400);
      push("run_completed", {
        runId: run.id,
        status: "awaiting_approval",
        summary: `Agent staged ${FIELDS.length} fields across ${steps.length} steps. Awaiting your approval.`
      });
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    }
  });
}
