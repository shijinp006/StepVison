import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/styles/design-tokens.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToastProvider } from "@/components/ToastProvider";
import { FloatingContact } from "@/components/FloatingContact";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StepVision Hotel Supplies - Premium Hospitality Solutions in UAE",
  description: "Your trusted partner for premium hotel supplies and hospitality solutions across the UAE. Browse our extensive catalog of tabletop, kitchen, housekeeping, and guest room essentials.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <ToastProvider />
        <FloatingContact />
      </body>
    </html>
  );
}
