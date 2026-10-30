"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUp, Bot, CheckCircle2, ChevronLeft, FileText, Globe, Loader2, Lock, Mic, PanelRight, Plus, Search, ShieldCheck, X
} from "lucide-react";

type EventItem = { id: number; type: string; payload: any };
type Msg = { id: number; from: "agent" | "user"; text: string; file?: string };

const EVENT_TYPES = ["run_started", "thought", "tool_call", "tool_result", "field_fill", "checkpoint", "awaiting_user", "run_completed", "error"];

const FIELDS = ["Full name", "Passport number", "Nationality", "Date of birth", "Email", "Phone", "Arrival date", "Purpose of stay"];

const AGENTS = [
  { id: "visa", name: "Visa Agent", color: "from-fuchsia-500 to-pink-500", preview: "Staging the UAE tourist visa form", time: "now", dot: true },
  { id: "docs", name: "Document Checker", color: "from-sky-500 to-cyan-500", preview: "Passport validity confirmed", time: "2m" },
  { id: "ocr", name: "Passport OCR", color: "from-emerald-500 to-teal-500", preview: "Read 8 fields from the biodata page", time: "9m" },
  { id: "crm", name: "CRM Follow-up", color: "from-amber-500 to-orange-500", preview: "3 clients need a reply today", time: "24m" },
  { id: "med", name: "Medical Booking", color: "from-rose-500 to-red-500", preview: "Slot held for Tuesday 10:30", time: "1h" },
  { id: "rep", name: "Report Agent", color: "from-violet-500 to-indigo-500", preview: "Nightly pipeline report ready", time: "3h" },
  { id: "inv", name: "Invoice Collector", color: "from-lime-500 to-green-500", preview: "Pulled 6 invoices from email", time: "5h" }
];

const ROUTINES = [
  { name: "Morning briefing", when: "Every day at 8:00 am", on: true },
  { name: "Inbox cleanup", when: "Weekdays at 6:00 pm", on: true },
  { name: "Weekly team update", when: "Paused", on: false }
];

export default function WorkspacePage({ params }: { params: { id: string } }) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("connecting");
  const [model, setModel] = useState<string | null>(null);
  const [steps, setSteps] = useState<string[]>([]);
  const [approved, setApproved] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("visa");
  const [showList, setShowList] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const counter = useRef(0);
  const msgId = useRef(0);
  const runId = `demo-run-${params.id}`;

  const addMsg = useCallback((from: Msg["from"], text: string, file?: string) => {
    msgId.current += 1;
    setMsgs((prev) => [...prev, { id: msgId.current, from, text, file }]);
  }, []);

  useEffect(() => {
    addMsg("agent", "Hi! I'm your Visa Agent. Tell me the destination and visa type, or press Enter to run the UAE tourist visa flow.");
    const source = new EventSource(`/api/runs/${runId}/stream`);
    const handle = (type: string) => (event: MessageEvent) => {
      let payload: any = {};
      try { payload = JSON.parse(event.data); } catch { payload = {}; }
      counter.current += 1;
      setEvents((prev) => [...prev, { id: counter.current, type, payload }].slice(-200));
      if (type === "run_started") {
        setStatus("running");
        setModel(payload.model ?? null);
        setSteps(Array.isArray(payload.steps) ? payload.steps : []);
        addMsg("agent", `Got it. I planned ${Array.isArray(payload.steps) ? payload.steps.length : "a few"} guarded steps with ${payload.model ?? "the model"} and I'm opening the portal now.`);
      }
      if (type === "thought" && payload.note) addMsg("agent", `${payload.note}. ${payload.detail ?? ""}`.trim());
      if (type === "field_fill" && payload.name) setFields((prev) => ({ ...prev, [payload.name]: String(payload.value ?? "") }));
      if (type === "checkpoint") { setStatus("awaiting_approval"); addMsg("agent", payload.note ?? "Form staged. Nothing submitted."); }
      if (type === "awaiting_user") addMsg("agent", "Please review the form on the right, then approve. Payment and final submission stay locked until you do.", "Application_Review.pdf");
      if (type === "run_completed") setStatus("awaiting_approval");
      if (type === "error") setStatus("error");
    };
    const listeners = EVENT_TYPES.map((t) => { const fn = handle(t); source.addEventListener(t, fn as EventListener); return { t, fn }; });
    return () => { listeners.forEach((l) => source.removeEventListener(l.t, l.fn as EventListener)); source.close(); };
  }, [runId, addMsg]);

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [msgs]);

  const filled = useMemo(() => Object.values(fields).filter(Boolean).length, [fields]);
  const filteredAgents = AGENTS.filter((a) => a.name.toLowerCase().includes(query.toLowerCase()));
  const current = AGENTS.find((a) => a.id === active) ?? AGENTS[0];

  const send = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setDraft("");
    addMsg("user", text);
    setSending(true);
    try {
      const r = await fetch("/api/ai/plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: text }) });
      const data = await r.json();
      const list = (data.steps ?? []).map((s: any, i: number) => `${i + 1}. ${s.title}`).join("\n");
      addMsg("agent", `Here's the guarded plan (${data.model}):\n${list}\nI'll hold at the approval gate before any submission or payment.`);
    } catch {
      addMsg("agent", "I couldn't reach the planner just now. Try again in a moment.");
    } finally {
      setSending(false);
    }
  };

  const eventLine = (e: EventItem) => {
    const p = e.payload || {};
    if (e.type === "tool_call") return `${p.tool} · ${p.args?.step ?? ""}`;
    if (e.type === "tool_result") return p.result ?? "";
    if (e.type === "field_fill") return `${p.name}: ${p.value}`;
    if (e.type === "thought") return p.note ?? "";
    return e.type.replace(/_/g, " ");
  };

  return (
    <main className="h-screen w-full overflow-hidden bg-[#f4f5f8] p-0 md:p-4">
      <div className="mx-auto flex h-full max-w-[1600px] overflow-hidden bg-white md:rounded-2xl md:border md:border-navy-100 md:shadow-card">
        {/* LEFT: agent list */}
        <aside className={`${showList ? "absolute inset-y-0 left-0 z-30 flex" : "hidden"} w-[290px] flex-none flex-col border-r border-navy-100 bg-[#f8f9fb] md:static md:flex md:w-[270px] xl:w-[300px]`}>
          <div className="flex items-center justify-between px-4 pb-2 pt-4">
            <Link href="/applications" className="flex items-center gap-2 text-sm font-semibold text-navy-900">
              <span className="rounded-lg bg-navy-700 p-1.5 text-white"><Globe className="h-3.5 w-3.5" /></span>
              GrokBot
            </Link>
            <div className="flex items-center gap-1">
              <button className="rounded-lg p-1.5 text-slate-500 hover:bg-white"><Plus className="h-4 w-4" /></button>
              <button onClick={() => setShowList(false)} className="rounded-lg p-1.5 text-slate-500 hover:bg-white md:hidden"><X className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="px-3 pb-2">
            <div className="flex items-center gap-2 rounded-xl border border-navy-100 bg-white px-3 py-2 text-sm text-slate-500">
              <Search className="h-3.5 w-3.5" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="w-full bg-transparent outline-none placeholder:text-slate-400" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-2">
            {filteredAgents.map((a) => (
              <button key={a.id} onClick={() => { setActive(a.id); setShowList(false); }} className={`mb-0.5 flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition ${active === a.id ? "bg-white shadow-sm ring-1 ring-navy-100" : "hover:bg-white/70"}`}>
                <span className={`flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-gradient-to-br ${a.color} text-xs font-semibold text-white`}>{a.name[0]}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-[13px] font-semibold text-navy-900">{a.name}</span>
                    <span className="flex-none text-[10px] text-slate-400">{a.time}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-[12px] text-slate-500">{a.preview}</span>
                    {a.dot ? <span className="h-1.5 w-1.5 flex-none rounded-full bg-sky-500" /> : null}
                  </span>
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2.5 border-t border-navy-100 px-4 py-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-700 text-xs font-semibold text-white">N</span>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-medium text-navy-900">VisaHOBe PTE LTD</div>
              <div className="text-[10px] text-slate-400">{params.id}</div>
            </div>
          </div>
        </aside>

        {showList ? <button aria-label="close" onClick={() => setShowList(false)} className="absolute inset-0 z-20 bg-black/20 md:hidden" /> : null}

        {/* CENTER: chat */}
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-navy-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <button onClick={() => setShowList(true)} className="rounded-lg p-1.5 text-slate-500 hover:bg-navy-50 md:hidden"><ChevronLeft className="h-4 w-4" /></button>
              <span className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${current.color} text-xs font-semibold text-white`}>{current.name[0]}</span>
              <div>
                <div className="text-sm font-semibold text-navy-900">{current.name}</div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  {status === "running" ? <Loader2 className="h-3 w-3 animate-spin text-amber-500" /> : <span className={`h-1.5 w-1.5 rounded-full ${status === "awaiting_approval" ? "bg-purple-500" : "bg-slate-300"}`} />}
                  {status.replace(/_/g, " ")}{model ? ` · ${model}` : ""}
                </div>
              </div>
            </div>
            <button onClick={() => setShowPanel(true)} className="rounded-lg p-1.5 text-slate-500 hover:bg-navy-50 lg:hidden"><PanelRight className="h-4 w-4" /></button>
          </header>

          <div ref={chatRef} className="flex-1 space-y-3 overflow-y-auto bg-[#fbfbfd] px-4 py-5 md:px-8">
            <div className="text-center text-[11px] text-slate-400">Today</div>
            {msgs.map((m) => (
              <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[82%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed md:max-w-[70%] ${m.from === "user" ? "rounded-br-md bg-navy-700 text-white" : "rounded-bl-md border border-navy-100 bg-white text-slate-700 shadow-sm"}`}>
                  {m.text}
                  {m.file ? (
                    <div className="mt-2 flex items-center gap-2 rounded-xl border border-navy-100 bg-navy-50 px-2.5 py-2 text-[12px] text-navy-900">
                      <span className="rounded-md bg-red-100 p-1 text-red-600"><FileText className="h-3.5 w-3.5" /></span>
                      <span>
                        <span className="block font-medium">{m.file}</span>
                        <span className="text-[10px] text-slate-500">3 pages · PDF</span>
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
            {sending ? (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-navy-100 bg-white px-3.5 py-3 shadow-sm">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:240ms]" />
                </div>
              </div>
            ) : null}
          </div>

          <div className="border-t border-navy-100 bg-white p-3 md:p-4">
            <div className="flex items-center gap-2 rounded-2xl border border-navy-100 bg-[#f8f9fb] px-3 py-2">
              <button className="rounded-lg p-1 text-slate-400 hover:text-navy-700"><Plus className="h-4 w-4" /></button>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                placeholder={`Message ${current.name}`}
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
              <button className="rounded-lg p-1 text-slate-400 hover:text-navy-700"><Mic className="h-4 w-4" /></button>
              <button onClick={send} disabled={!draft.trim() || sending} className="rounded-full bg-navy-700 p-1.5 text-white disabled:opacity-40"><ArrowUp className="h-4 w-4" /></button>
            </div>
          </div>
        </section>

        {/* RIGHT: screen + routines */}
        {showPanel ? <button aria-label="close" onClick={() => setShowPanel(false)} className="absolute inset-0 z-20 bg-black/20 lg:hidden" /> : null}
        <aside className={`${showPanel ? "absolute inset-y-0 right-0 z-30 flex" : "hidden"} w-[330px] max-w-[92vw] flex-none flex-col overflow-y-auto border-l border-navy-100 bg-white lg:static lg:flex xl:w-[360px]`}>
          <div className="flex items-center justify-between px-4 pb-1 pt-4">
            <div className="text-sm font-semibold text-navy-900">{current.name}'s screen</div>
            <button onClick={() => setShowPanel(false)} className="rounded-lg p-1 text-slate-500 hover:bg-navy-50 lg:hidden"><X className="h-4 w-4" /></button>
          </div>

          <div className="px-4 pb-3">
            <div className="overflow-hidden rounded-xl border border-navy-100 shadow-sm">
              <div className="flex items-center gap-1.5 border-b border-navy-100 bg-[#f4f5f8] px-2.5 py-1.5">
                <span className="h-2 w-2 rounded-full bg-red-400" /><span className="h-2 w-2 rounded-full bg-amber-400" /><span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="mx-auto truncate rounded bg-white px-2 py-0.5 text-[9px] text-slate-400">portal.gov.example/visa/apply</span>
              </div>
              <div className="space-y-1.5 bg-white p-3">
                {FIELDS.slice(0, 6).map((f) => (
                  <div key={f} className="flex items-center justify-between rounded-md border border-navy-100 px-2 py-1.5 text-[10.5px]">
                    <span className="text-slate-400">{f}</span>
                    <span className={fields[f] ? "font-medium text-navy-900" : "text-slate-300"}>{fields[f] || "—"}</span>
                  </div>
                ))}
                <div className="h-1.5 overflow-hidden rounded-full bg-navy-100">
                  <div className="h-full rounded-full bg-navy-700 transition-all" style={{ width: `${(filled / FIELDS.length) * 100}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400"><span>{filled}/{FIELDS.length} fields</span><span>{Math.round((filled / FIELDS.length) * 100)}%</span></div>
              </div>
            </div>
          </div>

          <div className="px-4 pb-2">
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

          {steps.length ? (
            <div className="px-4 pb-2 pt-2">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Agent plan</div>
              <ul className="space-y-1">
                {steps.map((s, i) => {
                  const done = events.some((e) => e.type === "tool_result" && e.payload?.index === i);
                  return (
                    <li key={`${s}-${i}`} className="flex items-start gap-2 text-[12px] text-slate-600">
                      {done ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-none text-emerald-600" /> : <span className="mt-1 h-3 w-3 flex-none rounded-full border border-slate-300" />}
                      <span className={done ? "text-navy-900" : ""}>{s}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          <div className="px-4 pb-2 pt-2">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Live log</div>
            <ul className="max-h-36 space-y-1 overflow-y-auto">
              {events.slice(-12).map((e) => (
                <li key={e.id} className="flex gap-2 text-[11px] leading-snug text-slate-500">
                  <Bot className="mt-0.5 h-3 w-3 flex-none text-slate-300" />
                  <span className="truncate">{eventLine(e)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-auto p-4">
            <div className="mb-2 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-amber-800">
              <Lock className="mt-0.5 h-3.5 w-3.5 flex-none" />
              Submission and payment are locked until you approve.
            </div>
            <button onClick={() => setApproved(true)} disabled={approved} className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white ${approved ? "bg-emerald-600" : "bg-navy-700 hover:bg-navy-900"}`}>
              {approved ? <CheckCircle2 className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
              {approved ? "Approved" : "Approve and continue"}
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
