import React from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppWidget } from "@/components/shared/WhatsAppWidget";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-[72px]">
        {children}
      </main>
      <Footer />
      <WhatsAppWidget />
    </div>
  );
}
