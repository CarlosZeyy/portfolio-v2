import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { AdminBackground } from "@/components/admin-scenes/AdminBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Carlos Moises Painel Admin",
  description: "Painel Admin do Portfolio de Carlos Moises",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Este layout exporta `metadata`, então tem que continuar Server
          Component — e usePathname só existe no cliente. A escolha da cena
          (buraco negro em /login, supernova no resto) mora no AdminBackground. */}
      <AdminBackground />
      <div className="min-h-screen flex flex-col lg:flex-row">
        <main className="flex-1 z-10 relative">{children}</main>
      </div>
    </>
  );
}
