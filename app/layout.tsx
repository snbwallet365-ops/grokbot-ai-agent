import "./globals.css";
import type { Metadata, Viewport } from "next";
import PwaRegister from "@/components/PwaRegister";

export const metadata: Metadata = {
  title: "GrokBot — AI Visa Agent",
  description: "GrokBot: AI visa agent with live browser workspace, document checks and approval gates",
  manifest: "/manifest.webmanifest",
  applicationName: "GrokBot",
  appleWebApp: { capable: true, title: "GrokBot", statusBarStyle: "default" },
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" }
};

export const viewport: Viewport = {
  themeColor: "#273E81",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
