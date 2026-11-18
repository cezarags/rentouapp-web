import "@fontsource-variable/inter";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { DemoBanner } from "@/components/layout/demo-banner";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: { default: "Rentou App — Compare, economize, viaje.", template: "%s · Rentou App" },
  description: "Compare preços de aluguel de carros nas principais locadoras do Brasil e economize na sua próxima viagem.",
};

export const viewport: Viewport = {
  themeColor: "#142650",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-dvh flex-col">
        <DemoBanner />
        <SiteHeader />
        <main className="flex flex-1 flex-col">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
