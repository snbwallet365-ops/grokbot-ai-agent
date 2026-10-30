export type AgentEvent = {
  seq: number;
  type:
    | "run_started"
    | "thought"
    | "tool_call"
    | "tool_result"
    | "screenshot"
    | "checkpoint"
    | "awaiting_user"
    | "run_completed"
    | "error";
  payload: Record<string, unknown>;
};

export function createSeedEvents(runId: string): AgentEvent[] {
  return [
    {
      seq: 1,
      type: "run_started",
      payload: { runId, plan: ["start_browser", "collect_profile", "validate_documents", "submit_application"] }
    },
    {
      seq: 2,
      type: "tool_call",
      payload: { tool: "start_browser", description: "Initialize the secure browser session" }
    },
    {
      seq: 3,
      type: "tool_result",
      payload: { tool: "start_browser", result: { ok: true } }
    },
    {
      seq: 4,
      type: "screenshot",
      payload: { base64: "" }
    }
  ];
}
