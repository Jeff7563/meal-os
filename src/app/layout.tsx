import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Thai, Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { MobileNav } from "@/components/layout/MobileNav";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";

const thaiFont = IBM_Plex_Sans_Thai({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-thai",
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
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
    { media: "(prefers-color-scheme: light)", color: "#F7F3EB" },
    { media: "(prefers-color-scheme: dark)", color: "#181A17" },
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
        className={`${thaiFont.variable} ${geistSans.variable} antialiased min-h-screen flex flex-col md:flex-row bg-[var(--background)] text-[var(--text-primary)] transition-colors duration-200 selection:bg-[var(--green-soft)] selection:text-[var(--green-dark)]`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            {/* Desktop Left Sidebar (220-240px) */}
            <DesktopSidebar />

            {/* Main Application Content Area */}
            <main className="flex-1 w-full min-h-screen px-4 sm:px-6 lg:px-8 py-4 md:py-8 overflow-x-hidden">
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
