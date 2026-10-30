# GrokBot — AI Visa Agent

Real AI agent workspace for visa consultancies. Responsive PWA: phone, iPad, desktop.

## What works
- `/chats` and `/chats/[agentId]`: 7 specialised agents, each backed by a live Mistral model with its own system prompt. Chats persist in the browser.
- `/applications`, `/applications/[id]`, `/applications/[id]/workspace`: dashboard, case detail, and live agent workspace streaming over SSE with an approval gate.
- `/api/chat`: real model reply with automatic model fallback. `/api/ai/plan`: guarded step plan. `/api/runs/[runId]/stream`: SSE event stream.
- PWA: manifest, service worker, installable icons, offline shell.

## Run
```
npm install
cp .env.example .env.local   # add MISTRAL_API_KEY
npm run dev
```

## Safety
The agent never submits or pays on its own. Submission stays behind a human approval gate, and agents are instructed never to fabricate government documents or reference numbers.
