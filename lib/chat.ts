const CHAT_MODELS = [
  process.env.MISTRAL_MODEL || "mistral-medium-latest",
  "ministral-8b-latest",
  "mistral-large-4"
];

function textOf(content: unknown): string {
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content.map((p: any) => (typeof p === "string" ? p : p?.type === "text" ? p.text : "")).join("").trim();
  }
  return "";
}

export async function agentReply(system: string, history: { role: "user" | "assistant"; content: string }[]) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) return { reply: "The AI key is not configured on the server yet.", model: "none" };

  for (const model of CHAT_MODELS) {
    try {
      const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          messages: [{ role: "system", content: system }, ...history.slice(-14)],
          temperature: 0.4,
          max_tokens: 600
        }),
        cache: "no-store"
      });
      if (!res.ok) continue;
      const data = await res.json();
      const reply = textOf(data?.choices?.[0]?.message?.content);
      if (reply) return { reply, model };
    } catch {
      continue;
    }
  }
  return { reply: "I couldn't reach the AI model just now. Please try again in a moment.", model: "fallback" };
}
