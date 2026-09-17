import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { Sidebar } from "@/components/Sidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { MenuOverlay } from "@/components/MenuOverlay";
import { SocialDock } from "@/components/SocialDock";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Carlos Moises",
  description: "Portfolio de Carlos Moises",
};

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="min-h-screen flex flex-col lg:flex-row">
          <Sidebar />
        <MenuOverlay />
        <MobileHeader />
        <SocialDock />

        <main className="flex-1">{children}</main>
      </div>
    </>
  );
}
