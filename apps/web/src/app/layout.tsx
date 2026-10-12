import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CareCircle Admin",
  description: "Family caregiver dashboard for medicine, meals, and sleep check-ins",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
            <a href="/" className="flex items-center gap-2.5 font-semibold text-slate-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-indigo-700 text-sm font-bold text-white shadow-sm shadow-indigo-200">
                CC
              </span>
              <span className="text-[15px] tracking-tight">CareCircle</span>
            </a>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
              Family Admin Dashboard
            </span>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
