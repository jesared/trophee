import type { ReactNode } from "react";

import { UserSidebar } from "@/components/layout/UserSidebar";
import { UserTopbar } from "@/components/layout/UserTopbar";

type UserLayoutProps = {
  children: ReactNode;
};

export default function UserLayout({ children }: UserLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/20">
      <UserSidebar />
      <main className="min-h-screen transition-all duration-200 md:pl-[var(--user-sidebar-width,260px)]">
        <UserTopbar />
        <div className="mx-auto w-full max-w-6xl px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
