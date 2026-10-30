export type AgentStep = {
  title: string;
  detail: string;
  tool: string;
};

const MODEL_CHAIN = [
  process.env.MISTRAL_MODEL || "mistral-medium-latest",
  "ministral-8b-latest",
  "mistral-large-4"
];

const DEFAULT_STEPS: AgentStep[] = [
  { title: "Open the official visa portal", detail: "Start an isolated browser session and load the government application page.", tool: "browser.open" },
  { title: "Prepare the applicant profile", detail: "Map passport, contact and travel details into the portal fields.", tool: "profile.map" },
  { title: "Validate documents", detail: "Check passport validity window and required supporting files before typing anything.", tool: "docs.validate" },
  { title: "Fill and review the form", detail: "Fill each section, capture evidence and pause for human review.", tool: "form.fill" },
  { title: "Await human approval", detail: "Hold submission and any payment until the operator confirms.", tool: "approval.gate" }
];

function textOf(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object") {
          const p = part as Record<string, unknown>;
          if (typeof p.text === "string") return p.text;
          if (typeof p.thinking === "string") return p.thinking;
        }
        return "";
      })
      .join(" ")
      .trim();
  }
  return "";
}

function parseSteps(raw: string): AgentStep[] {
  const cleaned = raw.replace(/```json/gi, "```").split("```").join("").trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1) return [];
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item: unknown, index: number) => {
        if (typeof item === "string") {
          return { title: item.replace(/_/g, " "), detail: "Planned by the visa agent.", tool: "agent.step" };
        }
        if (item && typeof item === "object") {
          const o = item as Record<string, unknown>;
          return {
            title: String(o.title || o.name || `Step ${index + 1}`).slice(0, 90),
            detail: String(o.detail || o.description || "Planned by the visa agent.").slice(0, 200),
            tool: String(o.tool || "agent.step").slice(0, 40)
          };
        }
        return null;
      })
      .filter(Boolean) as AgentStep[];
  } catch {
    return [];
  }
}

export async function generatePlan(prompt: string): Promise<{ steps: AgentStep[]; model: string }> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) return { steps: DEFAULT_STEPS, model: "offline-fallback" };

  const body = {
    messages: [
      {
        role: "system",
        content:
          "You plan guarded visa application workflows. Reply with JSON only: {\"steps\":[{\"title\":\"short action\",\"detail\":\"one sentence\",\"tool\":\"one of browser.open, profile.map, docs.validate, form.fill, approval.gate\"}]}. Give 4 to 6 steps. Never include payment or final submission without a human approval gate."
      },
      { role: "user", content: prompt || "Plan a tourist visa application workflow." }
    ],
    temperature: 0.2,
    max_tokens: 700
  };

  for (const model of MODEL_CHAIN) {
    try {
      const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ ...body, model }),
        cache: "no-store"
      });
      if (!response.ok) continue;
      const data = await response.json();
      const raw = textOf(data?.choices?.[0]?.message?.content);
      const steps = parseSteps(raw);
      if (steps.length >= 3) return { steps: steps.slice(0, 6), model };
    } catch {
      continue;
    }
  }
  return { steps: DEFAULT_STEPS, model: "fallback" };
}
