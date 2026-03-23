"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { Container } from "@/components/container";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin") || pathname.startsWith("/me")) {
    return <div className="min-h-screen bg-muted/20">{children}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Container className="py-10 fade-up">{children}</Container>
      </main>
      <SiteFooter />
    </div>
  );
}
