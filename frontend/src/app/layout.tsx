import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import MobileHeader from "@/components/MobileHeader";
import DesktopHeader from "@/components/DesktopHeader";
import { WebSocketProvider } from "@/components/WebSocketProvider";

export const metadata: Metadata = {
  title: "VedaAI — AI Assessment Creator",
  description:
    "Create customized question papers and assessments powered by AI for teachers and educators.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F4F4F5] antialiased">
        <WebSocketProvider />
        <Sidebar />
        <MobileHeader />

        {/* Main content area */}
        <main className="lg:ml-[260px] min-h-screen pb-20 lg:pb-0">
          <DesktopHeader />
          {children}
        </main>

        <BottomNav />
      </body>
    </html>
  );
}
