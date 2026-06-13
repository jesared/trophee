import type { ReactNode } from "react";
import { Suspense } from "react";

import { UserSidebar } from "@/components/layout/UserSidebar";
import { UserTopbar } from "@/components/layout/UserTopbar";

type UserLayoutProps = {
  children: ReactNode;
};

export default function UserLayout({ children }: UserLayoutProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_color-mix(in_oklab,var(--color-primary)_8%,transparent),transparent_28%),linear-gradient(to_bottom,var(--color-muted)_0%,var(--color-background)_220px)]">
      <UserSidebar />
      <main className="min-h-screen transition-all duration-200 md:pl-[var(--user-sidebar-width,260px)]">
        <Suspense fallback={null}>
          <UserTopbar />
        </Suspense>
        <section className="px-4 pb-10 pt-6 sm:pt-8 lg:px-6">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </section>
      </main>
    </div>
  );
}
