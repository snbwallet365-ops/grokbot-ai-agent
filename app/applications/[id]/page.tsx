import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, MonitorPlay, ShieldCheck } from "lucide-react";

const demoApplications: Record<string, { country: string; visaType: string; status: string; progress: number; applicant: string; passport: string }> = {
  "visa-demo": { country: "United Arab Emirates", visaType: "Tourist visa", status: "In review", progress: 72, applicant: "Aisha Rahman", passport: "P1234567" },
  "app-2": { country: "Canada", visaType: "Study permit", status: "Pending docs", progress: 45, applicant: "Tanvir Ahmed", passport: "A04412288" },
  "app-3": { country: "Germany", visaType: "Work visa", status: "Queued", progress: 18, applicant: "Md Rakib Hasan", passport: "B00931184" }
};

export default function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const app = demoApplications[params.id];
  if (!app) return notFound();

  return (
    <main className="min-h-screen bg-white p-6 lg:p-10">
      <div className="mx-auto max-w-6xl rounded-3xl border border-navy-100 bg-white p-8 shadow-card">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.12em] text-slate-500">Application details</p>
            <h1 className="mt-2 text-3xl font-semibold text-navy-900">{app.visaType}</h1>
          </div>
          <span className="rounded-full bg-navy-100 px-3 py-1 text-sm font-medium text-navy-700">{app.status}</span>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Destination", value: app.country },
            { label: "Applicant", value: app.applicant },
            { label: "Passport", value: app.passport },
            { label: "Risk level", value: "Low" }
          ].map((box) => (
            <div key={box.label} className="rounded-2xl bg-navy-50 p-5">
              <div className="text-sm text-slate-500">{box.label}</div>
              <div className="mt-2 text-lg font-semibold text-navy-900">{box.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-navy-100 p-5">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Agent progress</span>
            <span>{app.progress}%</span>
          </div>
          <div className="mt-2 h-2.5 rounded-full bg-navy-100">
            <div className="h-full rounded-full bg-navy-700" style={{ width: `${app.progress}%` }} />
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            Submission and payment stay blocked until you approve.
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/applications/${params.id}/workspace`} className="inline-flex items-center gap-2 rounded-xl bg-navy-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-navy-900">
            <MonitorPlay className="h-4 w-4" />
            Open live workspace
          </Link>
          <Link href="/applications" className="inline-flex items-center gap-2 rounded-xl border border-navy-100 bg-white px-5 py-3 text-sm font-medium text-navy-700 transition hover:bg-navy-50">
            Back to dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
