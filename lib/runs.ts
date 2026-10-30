import { generatePlan, type AgentStep } from "@/lib/mistral";

export type Run = {
  id: string;
  applicationId: string;
  prompt: string;
  status: "queued" | "running" | "awaiting_approval" | "completed";
  steps: AgentStep[];
  model: string;
  createdAt: string;
};

type Store = { runs: Map<string, Run> };

const globalStore = globalThis as typeof globalThis & { __grokbotRuns?: Store };
if (!globalStore.__grokbotRuns) globalStore.__grokbotRuns = { runs: new Map() };
const store = globalStore.__grokbotRuns;

export function listRuns() {
  return Array.from(store.runs.values()).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function createRun(applicationId: string, prompt: string): Promise<Run> {
  const plan = await generatePlan(prompt || "Plan a guarded tourist visa application workflow.");
  const run: Run = {
    id: `run_${Math.random().toString(36).slice(2, 10)}`,
    applicationId: applicationId || "visa-demo",
    prompt: prompt || "Guarded tourist visa application workflow",
    status: "queued",
    steps: plan.steps,
    model: plan.model,
    createdAt: new Date().toISOString()
  };
  store.runs.set(run.id, run);
  store.runs.set(`demo-run-${run.applicationId}`, run);
  return run;
}

export async function getRun(runId: string, applicationIdHint?: string): Promise<Run> {
  const existing = store.runs.get(runId);
  if (existing) return existing;
  const hint = applicationIdHint || runId.replace(/^demo-run-/, "") || "visa-demo";
  return createRun(hint, "Plan a guarded tourist visa application workflow for a UAE tourist visa.");
}
