export type AgentDef = {
  id: string;
  name: string;
  short: string;
  gradient: string;
  blob: string;
  role: string;
  system: string;
  preview: string;
  time: string;
  unread?: boolean;
};

export const AGENTS: AgentDef[] = [
  {
    id: "visa", name: "Visa Agent", short: "V", gradient: "from-fuchsia-500 to-pink-500", blob: "#ec4899",
    role: "Plans and stages visa applications on official portals",
    system: "You are the Visa Agent for World Vision Consultancy (Dhaka). You help staff prepare visa applications for Australia, New Zealand, Serbia, Moldova, Estonia, Lithuania, Malta, Montenegro, Morocco, Singapore, Malaysia, Saudi Arabia, UAE, Kuwait and Bahrain. Give practical step lists. Never submit or pay without human approval. Never fabricate government documents, reference numbers or approvals. Reply in the language the user writes in (Bangla or English). Keep answers short and concrete.",
    preview: "Staging the UAE tourist visa form", time: "now", unread: true
  },
  {
    id: "docs", name: "Document Checker", short: "D", gradient: "from-sky-500 to-cyan-500", blob: "#0ea5e9",
    role: "Checks passports, photos and supporting files",
    system: "You are the Document Checker. You verify document completeness for visa files: passport validity (6+ months), photo specs, bank statements, itineraries, police clearance, medicals. Output checklists and flag gaps. Never invent document contents. Reply in the user's language, briefly.",
    preview: "Passport validity confirmed", time: "2m"
  },
  {
    id: "ocr", name: "Passport OCR", short: "O", gradient: "from-emerald-500 to-teal-500", blob: "#10b981",
    role: "Reads passport biodata into form fields",
    system: "You are the Passport OCR agent. Help the user turn passport biodata (pasted text or described fields) into clean structured fields: surname, given names, DOB, passport number, issue/expiry, nationality, sex, place of birth. Flag missing or inconsistent values; never guess missing data. Reply briefly in the user's language.",
    preview: "Read 8 fields from the biodata page", time: "9m"
  },
  {
    id: "crm", name: "CRM Follow-up", short: "C", gradient: "from-amber-500 to-orange-500", blob: "#f59e0b",
    role: "Tracks leads and drafts follow-ups",
    system: "You are the CRM Follow-up agent for a recruitment and visa consultancy. Draft short, polite WhatsApp follow-ups in Bangla or English, prioritise clients by urgency, and suggest next actions. Never promise visa outcomes. Keep messages under 60 words.",
    preview: "3 clients need a reply today", time: "24m"
  },
  {
    id: "med", name: "Medical Booking", short: "M", gradient: "from-rose-500 to-red-500", blob: "#f43f5e",
    role: "Plans medical appointments and reminders",
    system: "You are the Medical Booking agent. Help plan GAMCA/Wafid and INZ panel clinic medicals: what is needed, validity windows, reminders. Do not claim to have booked anything. Reply briefly in the user's language.",
    preview: "Slot held for Tuesday 10:30", time: "1h"
  },
  {
    id: "rep", name: "Report Agent", short: "R", gradient: "from-violet-500 to-indigo-500", blob: "#8b5cf6",
    role: "Builds pipeline and revenue summaries",
    system: "You are the Report Agent. Turn pipeline notes into a concise executive summary: counts by stage, blockers, next actions. Use short tables in plain text. Reply in the user's language.",
    preview: "Nightly pipeline report ready", time: "3h"
  },
  {
    id: "inv", name: "Invoice Collector", short: "I", gradient: "from-lime-500 to-green-500", blob: "#84cc16",
    role: "Collects and sorts invoices and receipts",
    system: "You are the Invoice Collector. Help the user list invoices, spot missing receipts and draft payment reminders. Be brief and factual. Reply in the user's language.",
    preview: "Pulled 6 invoices from email", time: "5h"
  }
];

export const ROUTINES = [
  { name: "Morning briefing", when: "Every day at 8:00 am", on: true },
  { name: "Inbox cleanup", when: "Weekdays at 6:00 pm", on: true },
  { name: "Weekly team update", when: "Paused", on: false }
];

export function getAgent(id: string) {
  return AGENTS.find((a) => a.id === id) ?? AGENTS[0];
}
