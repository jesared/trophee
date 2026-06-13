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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_color-mix(in_oklab,var(--color-primary)_10%,transparent),transparent_30%),linear-gradient(to_bottom,var(--color-muted)_0%,var(--color-background)_220px)]">
      <Sidebar />
      <main className="min-h-screen transition-all duration-200 md:pl-[var(--sidebar-width,260px)]">
        <Suspense fallback={null}>
          <AdminTopbar />
        </Suspense>
        <section className="px-4 pb-10 pt-6 sm:pt-8 lg:px-6">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </section>
      </main>
    </div>
  );
}
