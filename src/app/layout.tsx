import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { MobileNav } from "@/components/layout/MobileNav";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Personal Meal OS - ตารางอาหารเพื่อสุขภาพและลดน้ำหนัก",
  description:
    "เว็บแอปจัดตารางอาหารเพื่อลดน้ำหนัก ใช้งานง่าย เปิดแล้วรู้ทันทีว่าวันนี้ต้องกินอะไร พร้อมระบบวัตถุดิบและติดตามผล",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Meal OS",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#090d16" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            {/* Desktop Left Sidebar */}
            <DesktopSidebar />

            {/* Main Application Content Area */}
            <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 overflow-x-hidden">
              {children}
            </main>

            {/* Mobile Fixed Bottom Navigation */}
            <MobileNav />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
