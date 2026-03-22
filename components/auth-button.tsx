"use client";

import { signIn, signOut } from "next-auth/react";

import { useCurrentUser } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";

export function AuthButton() {
  const user = useCurrentUser();
  const hasGoogleProvider = Boolean(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ??
      process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID,
  );

  if (!hasGoogleProvider) {
    return (
      <div className="rounded-md border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground">
        Auth Google non configur�
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-muted-foreground sm:inline">
          {user.name ?? user.email}
        </span>
        <Button variant="outline" size="sm" onClick={() => signOut()}>
          Logout
        </Button>
      </div>
    );
  }

  return (
    <Button size="sm" onClick={() => signIn("google")}> 
      Login
    </Button>
  );
}
