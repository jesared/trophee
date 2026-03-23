import type { ReactNode } from "react";
import { Suspense } from "react";

import { AdminTopbar } from "@/components/layout/AdminTopbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { requireAdmin } from "@/lib/require-admin";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-muted/20">
      <Sidebar />
      <main className="min-h-screen transition-all duration-200 md:pl-[var(--sidebar-width,260px)]">
        <Suspense fallback={null}>
          <AdminTopbar />
        </Suspense>
        <div className="mx-auto w-full max-w-6xl px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
