"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUp, Bot, CheckCircle2, Globe, LayoutGrid, Loader2, Mic, PanelRight, Plus, Search, Settings, X } from "lucide-react";
import { AGENTS, ROUTINES, getAgent } from "@/lib/agents";

type Msg = { id: string; role: "user" | "assistant"; content: string };
const KEY = (id: string) => `grokbot:chat:${id}`;

function loadChat(id: string): Msg[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY(id)) || "[]"); } catch { return []; }
}

function lastLine(id: string, fallback: string) {
  const m = loadChat(id);
  return m.length ? m[m.length - 1].content.replace(/\s+/g, " ").slice(0, 60) : fallback;
}

export default function ChatApp({ activeId }: { activeId: string | null }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [panel, setPanel] = useState(false);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [model, setModel] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const agent = activeId ? getAgent(activeId) : null;

  useEffect(() => {
    const p: Record<string, string> = {};
    AGENTS.forEach((a) => (p[a.id] = lastLine(a.id, a.preview)));
    setPreviews(p);
  }, [msgs, activeId]);

  useEffect(() => {
    if (!agent) { setMsgs([]); return; }
    const saved = loadChat(agent.id);
    setMsgs(saved.length ? saved : [{ id: "hello", role: "assistant", content: `Hi, I'm ${agent.name}. ${agent.role}. How can I help?` }]);
    setModel(null);
  }, [agent?.id]);

  useEffect(() => {
    if (agent && msgs.length) localStorage.setItem(KEY(agent.id), JSON.stringify(msgs.slice(-60)));
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [msgs, agent]);

  const filtered = useMemo(() => AGENTS.filter((a) => a.name.toLowerCase().includes(query.toLowerCase())), [query]);

  const send = useCallback(async (override?: string) => {
    const text = (override ?? draft).trim();
    if (!text || busy || !agent) return;
    const next: Msg[] = [...msgs, { id: `u${Date.now()}`, role: "user", content: text }];
    setMsgs(next);
    setDraft("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: agent.id, messages: next.filter((m) => m.id !== "hello").map(({ role, content }) => ({ role, content })) })
      });
      const data = await res.json();
      setModel(data.model ?? null);
      setMsgs((p) => [...p, { id: `a${Date.now()}`, role: "assistant", content: data.reply || data.error || "No reply." }]);
    } catch {
      setMsgs((p) => [...p, { id: `e${Date.now()}`, role: "assistant", content: "Network problem. Please try again." }]);
    } finally {
      setBusy(false);
    }
  }, [agent, busy, draft, msgs]);

  const voice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Voice input is not supported in this browser."); return; }
    const r = new SR();
    r.lang = "bn-BD";
    r.onresult = (e: any) => setDraft((d) => (d ? d + " " : "") + e.results[0][0].transcript);
    r.start();
  };

  const newChat = () => {
    if (!agent) return;
    localStorage.removeItem(KEY(agent.id));
    setMsgs([{ id: "hello", role: "assistant", content: `New chat started. How can I help with ${agent.name.toLowerCase()} tasks?` }]);
  };

  /* ---------- sidebar list (shared) ---------- */
  const list = (
    <div className="flex-1 overflow-y-auto px-2 pb-3">
      {filtered.map((a) => {
        const on = activeId === a.id;
        return (
          <Link key={a.id} href={`/chats/${a.id}`} className={`mb-0.5 flex items-center gap-3 rounded-2xl px-3 py-2.5 transition ${on ? "bg-white shadow-sm ring-1 ring-navy-100" : "hover:bg-white/70"}`}>
            <span className={`flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-gradient-to-br ${a.gradient} text-sm font-semibold text-white`}>{a.short}</span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="truncate text-[14px] font-semibold text-navy-900">{a.name}</span>
                <span className="flex-none text-[10px] text-slate-400">{a.time}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="truncate text-[12.5px] text-slate-500">{previews[a.id] ?? a.preview}</span>
                {a.unread ? <span className="h-2 w-2 flex-none rounded-full bg-sky-500" /> : null}
              </span>
            </span>
          </Link>
        );
      })}
      {filtered.length === 0 ? <div className="p-6 text-center text-sm text-slate-400">No agents match “{query}”.</div> : null}
    </div>
  );

  const header = (
    <div className="px-4 pb-2 pt-4">
      <div className="flex items-center justify-between">
        <Link href="/chats" className="flex items-center gap-2 text-base font-semibold text-navy-900">
          <span className="rounded-xl bg-navy-700 p-1.5 text-white"><Globe className="h-4 w-4" /></span>
          GrokBot
        </Link>
        <div className="flex items-center gap-1 text-slate-500">
          <Link href="/applications" className="rounded-lg p-2 hover:bg-white" aria-label="Applications"><LayoutGrid className="h-4 w-4" /></Link>
          <button onClick={() => router.push("/chats/visa")} className="rounded-lg p-2 hover:bg-white" aria-label="New chat"><Plus className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-2xl border border-navy-100 bg-white px-3 py-2 text-sm text-slate-500">
        <Search className="h-4 w-4" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="w-full bg-transparent outline-none placeholder:text-slate-400" />
      </div>
    </div>
  );

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[#f4f5f8] md:p-3 lg:p-4">
      <div className="relative mx-auto flex h-full w-full max-w-[1600px] overflow-hidden bg-white md:rounded-2xl md:border md:border-navy-100 md:shadow-card">
        {/* LEFT / MOBILE HOME */}
        <aside className={`${agent ? "hidden md:flex" : "flex"} w-full flex-none flex-col bg-[#f8f9fb] md:w-[300px] md:border-r md:border-navy-100 xl:w-[330px]`}>
          {header}

          {/* mobile: colourful bubbles row like the reference */}
          <div className="md:hidden">
            <div className="flex gap-4 overflow-x-auto px-4 pb-3 pt-2">
              {AGENTS.slice(0, 6).map((a) => (
                <Link key={a.id} href={`/chats/${a.id}`} className="flex w-[68px] flex-none flex-col items-center gap-1.5">
                  <span className={`flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br ${a.gradient} text-xl font-semibold text-white shadow-md`}>{a.short}</span>
                  <span className="w-full truncate text-center text-[11px] font-medium text-navy-900">{a.name.split(" ")[0]}</span>
                </Link>
              ))}
            </div>
          </div>
          {list}

          <div className="hidden items-center gap-2.5 border-t border-navy-100 px-4 py-3 md:flex">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-700 text-xs font-semibold text-white">N</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium text-navy-900">VisaHOBe PTE LTD</div>
              <div className="text-[10px] text-slate-400">World Vision Consultancy</div>
            </div>
            <Link href="/applications" className="rounded-lg p-1.5 text-slate-400 hover:bg-white"><Settings className="h-4 w-4" /></Link>
          </div>
        </aside>

        {/* CENTER */}
        <section className={`${agent ? "flex" : "hidden md:flex"} min-w-0 flex-1 flex-col`}>
          {agent ? (
            <>
              <header className="flex items-center justify-between border-b border-navy-100 px-3 py-2.5 md:px-4">
                <div className="flex items-center gap-2.5">
                  <Link href="/chats" className="rounded-lg p-1.5 text-slate-500 hover:bg-navy-50 md:hidden" aria-label="Back"><ArrowLeft className="h-5 w-5" /></Link>
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${agent.gradient} text-sm font-semibold text-white`}>{agent.short}</span>
                  <div>
                    <div className="text-sm font-semibold text-navy-900">{agent.name}</div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      {busy ? <Loader2 className="h-3 w-3 animate-spin text-amber-500" /> : <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                      {busy ? "thinking…" : `online${model ? ` · ${model}` : ""}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={newChat} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-navy-700 hover:bg-navy-50">New chat</button>
                  <button onClick={() => setPanel(true)} className="rounded-lg p-2 text-slate-500 hover:bg-navy-50 lg:hidden" aria-label="Details"><PanelRight className="h-4 w-4" /></button>
                </div>
              </header>

              <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto bg-[#fbfbfd] px-3 py-5 md:px-8">
                <div className="text-center text-[11px] text-slate-400">Today</div>
                {msgs.map((m) => (
                  <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[86%] whitespace-pre-wrap break-words rounded-3xl px-4 py-2.5 text-[14px] leading-relaxed md:max-w-[70%] ${m.role === "user" ? "rounded-br-lg bg-navy-700 text-white" : "rounded-bl-lg border border-navy-100 bg-white text-slate-700 shadow-sm"}`}>{m.content}</div>
                  </div>
                ))}
                {busy ? (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1.5 rounded-3xl rounded-bl-lg border border-navy-100 bg-white px-4 py-3 shadow-sm">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:120ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:240ms]" />
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="border-t border-navy-100 bg-white p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:p-4">
                <div className="flex items-center gap-2 rounded-3xl border border-navy-100 bg-[#f8f9fb] px-3 py-2">
                  <Link href="/applications" className="rounded-lg p-1 text-slate-400 hover:text-navy-700" aria-label="Applications"><Plus className="h-5 w-5" /></Link>
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                    placeholder={`Message ${agent.name}`}
                    className="w-full bg-transparent py-1 text-[15px] outline-none placeholder:text-slate-400"
                  />
                  <button onClick={voice} className="rounded-lg p-1 text-slate-400 hover:text-navy-700" aria-label="Voice"><Mic className="h-5 w-5" /></button>
                  <button onClick={() => send()} disabled={!draft.trim() || busy} className="rounded-full bg-navy-700 p-2 text-white disabled:opacity-40" aria-label="Send"><ArrowUp className="h-4 w-4" /></button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
              <span className="rounded-2xl bg-navy-50 p-4 text-navy-700"><Bot className="h-8 w-8" /></span>
              <div className="text-lg font-semibold text-navy-900">Pick an agent to start</div>
              <p className="max-w-sm text-sm text-slate-500">Each agent is a real AI model with its own job. Choose one from the list, or open the Visa Agent.</p>
              <Link href="/chats/visa" className="rounded-xl bg-navy-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-navy-900">Open Visa Agent</Link>
            </div>
          )}
        </section>

        {/* RIGHT */}
        {agent ? (
          <>
            {panel ? <button aria-label="close" onClick={() => setPanel(false)} className="absolute inset-0 z-20 bg-black/25 lg:hidden" /> : null}
            <aside className={`${panel ? "absolute inset-y-0 right-0 z-30 flex" : "hidden"} w-[340px] max-w-[92vw] flex-none flex-col overflow-y-auto border-l border-navy-100 bg-white lg:static lg:flex xl:w-[360px]`}>
              <div className="flex items-center justify-between px-4 pb-1 pt-4">
                <div className="text-sm font-semibold text-navy-900">{agent.name}</div>
                <button onClick={() => setPanel(false)} className="rounded-lg p-1 text-slate-500 hover:bg-navy-50 lg:hidden"><X className="h-4 w-4" /></button>
              </div>
              <div className="px-4 pb-3">
                <div className={`rounded-2xl bg-gradient-to-br ${agent.gradient} p-5 text-white shadow-md`}>
                  <div className="text-2xl font-semibold">{agent.short}</div>
                  <div className="mt-1 text-sm font-medium">{agent.name}</div>
                  <p className="mt-1 text-[12px] leading-relaxed text-white/85">{agent.role}</p>
                </div>
              </div>
              <div className="px-4 pb-3">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Quick actions</div>
                <div className="grid gap-1.5">
                  {["Make a checklist for a UAE tourist visa", "Check passport validity rules", "Draft a client follow-up in Bangla"].map((q) => (
                    <button key={q} onClick={() => { setPanel(false); send(q); }} className="rounded-xl border border-navy-100 px-3 py-2 text-left text-[12.5px] text-slate-600 hover:bg-navy-50">{q}</button>
                  ))}
                </div>
              </div>
              <div className="px-4 pb-3">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Routines</div>
                <ul className="space-y-1.5">
                  {ROUTINES.map((r) => (
                    <li key={r.name} className="flex items-center gap-2.5 rounded-xl border border-navy-100 px-3 py-2">
                      <CheckCircle2 className={`h-4 w-4 flex-none ${r.on ? "text-emerald-500" : "text-slate-300"}`} />
                      <span className="min-w-0">
                        <span className="block truncate text-[12.5px] font-medium text-navy-900">{r.name}</span>
                        <span className="block text-[11px] text-slate-400">{r.when}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-auto space-y-2 p-4">
                <Link href="/applications/visa-demo/workspace" className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-900">Open live browser workspace</Link>
                <Link href="/applications" className="flex w-full items-center justify-center rounded-xl border border-navy-100 px-4 py-2.5 text-sm font-medium text-navy-700 hover:bg-navy-50">Applications</Link>
              </div>
            </aside>
          </>
        ) : null}
      </div>
    </div>
  );
}
