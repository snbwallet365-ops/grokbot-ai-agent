import Link from "next/link";
import { ArrowRight, Bot, Globe, MonitorPlay, ShieldCheck, Sparkles } from "lucide-react";

const features = [
  { icon: Bot, title: "Visa workflow AI", description: "Plans each government portal step with Mistral, then fills, validates and stages it." },
  { icon: MonitorPlay, title: "Live browser view", description: "Every agent action streams into the workspace as it happens, with the form filling in front of you." },
  { icon: ShieldCheck, title: "Human approval gates", description: "Payment and final submission stay blocked until an operator approves." }
];

const steps = [
  { n: "01", title: "Describe the case", detail: "Destination, visa type and applicant — one line in Bangla or English." },
  { n: "02", title: "Agent plans", detail: "The agent returns a guarded step plan and opens the portal session." },
  { n: "03", title: "Form fills live", detail: "Fields are mapped and typed in an isolated browser you can watch." },
  { n: "04", title: "You approve", detail: "Nothing is submitted or paid until you confirm." }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-navy-900">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <header className="mb-10 flex items-center justify-between rounded-2xl border border-navy-100 bg-white px-5 py-3 shadow-card">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-navy-700 p-2 text-white">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold">GrokBot</p>
              <p className="text-xs text-slate-500">AI Visa Agent</p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <Link href="/chats" className="hover:text-navy-700">Chats</Link>
            <Link href="/applications" className="hover:text-navy-700">Dashboard</Link>
            <Link href="/applications/visa-demo/workspace" className="hover:text-navy-700">Live workspace</Link>
          </nav>
          <Link href="/chats" className="rounded-full bg-navy-700 px-4 py-2 text-sm font-medium text-white hover:bg-navy-900">
            Open app
          </Link>
        </header>

        <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-navy-100 bg-navy-50 px-3 py-1.5 text-xs font-medium text-navy-700">
              <Sparkles className="h-3.5 w-3.5" />
              White-theme AI browser automation
            </div>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-navy-900 md:text-6xl">
              Smart visa automation with a live AI browser agent.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-600">
              Passport validation, portal automation, document review, real-time event logs and approval-first workflows — in one workspace.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/chats" className="inline-flex items-center gap-2 rounded-xl bg-navy-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-navy-900">
                Start workflow
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/applications" className="inline-flex items-center gap-2 rounded-xl border border-navy-100 bg-white px-5 py-3 text-sm font-medium text-navy-700 transition hover:bg-navy-50">
                View applications
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-navy-100 bg-navy-50 p-6 shadow-card">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white p-2 text-navy-700 shadow-sm">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium text-navy-900">Agent status</div>
                  <div className="text-xs text-slate-500">Live runner active</div>
                </div>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">Online</span>
            </div>
            <div className="space-y-3">
              {[
                { label: "Portal intake", status: "Completed" },
                { label: "Passport validation", status: "Completed" },
                { label: "Form fill", status: "Running" },
                { label: "Human approval", status: "Queued" }
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl bg-white p-3 text-sm">
                  <span className="text-slate-600">{item.label}</span>
                  <span className={item.status === "Completed" ? "text-emerald-600" : item.status === "Running" ? "text-amber-500" : "text-slate-500"}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
              Confirmation gates enforced before submission.
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-5 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-navy-100 bg-white p-5 shadow-card">
              <div className="mb-3 inline-flex rounded-xl bg-navy-50 p-2 text-navy-700">
                <f.icon className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold text-navy-900">{f.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{f.description}</p>
            </div>
          ))}
        </section>

        <section className="mt-16 rounded-3xl border border-navy-100 bg-navy-50 p-8">
          <h2 className="text-2xl font-semibold text-navy-900">How it works</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="rounded-2xl bg-white p-4 shadow-card">
                <div className="text-xs font-semibold tracking-[0.14em] text-navy-500">{s.n}</div>
                <div className="mt-2 font-medium text-navy-900">{s.title}</div>
                <p className="mt-1 text-sm text-slate-600">{s.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
