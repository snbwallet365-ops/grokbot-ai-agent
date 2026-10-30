type MistralMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export async function generatePlanFromPrompt(prompt: string) {
  const apiKey = process.env.MISTRAL_API_KEY;

  if (!apiKey) {
    return [
      "start_browser",
      "collect_profile",
      "validate_documents",
      "await_user_confirmation",
      "submit_application"
    ];
  }

  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "mistral-large-latest",
      messages: [
        {
          role: "system",
          content: "Return a JSON array of 4-6 agent steps for a secure visa application workflow. Only include approved government portal actions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    return [
      "start_browser",
      "collect_profile",
      "validate_documents",
      "await_user_confirmation",
      "submit_application"
    ];
  }

  const data = await response.json();
  const message = data.choices?.[0]?.message?.content ?? "[]";

  try {
    const parsed = JSON.parse(message);
    return Array.isArray(parsed.steps) ? parsed.steps : Array.isArray(parsed) ? parsed : ["start_browser", "collect_profile", "validate_documents", "submit_application"];
  } catch {
    return ["start_browser", "collect_profile", "validate_documents", "submit_application"];
  }
}
