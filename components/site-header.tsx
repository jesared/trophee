"use client";

import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  Home,
  LogIn,
  LogOut,
  Menu,
  Shield,
  Trophy,
  UserCircleIcon,
} from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Accueil", href: "/", icon: Home },
  { label: "Trophée", href: "/trophee", icon: Trophy },
  { label: "Agenda & salles", href: "/agenda", icon: CalendarDays },
  { label: "Classement", href: "/classement", icon: BarChart3 },
  { label: "Inscription", href: "/inscription", icon: ClipboardList },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}

function UserMenu() {
  const { data } = useSession();
  const user = data?.user;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";
  const isAdmin = user?.role === "ADMIN";

  if (!user) {
    return (
      <Button size="sm" asChild>
        <Link href="/login">Login</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 px-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image ?? ""} alt={user.name ?? "User"} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="space-y-1">
          <p className="text-sm font-medium">{user.name ?? "Utilisateur"}</p>
          {user.email ? (
            <p className="text-xs text-muted-foreground">{user.email}</p>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/me">
            <UserCircleIcon className="h-4 w-4" />
            Mon espace
          </Link>
        </DropdownMenuItem>
        {isAdmin ? (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { data } = useSession();
  const user = data?.user;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";
  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="border-b border-border/50 bg-muted/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2 text-xs text-muted-foreground">
          <span>Inscriptions ouvertes — rejoignez la saison en cours.</span>
          <Link
            href="/inscription"
            className="font-medium text-foreground transition-colors hover:text-primary"
          >
            S'inscrire
          </Link>
        </div>
      </div>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            Trophée FG
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "transition-colors hover:text-foreground",
                    active && "font-medium text-primary",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            <UserMenu />
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Accès rapide aux pages principales.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-6 px-2">
                <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={user?.image ?? ""}
                      alt={user?.name ?? "User"}
                    />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {user?.name ?? "Visiteur"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user?.email ??
                        "Connectez-vous pour gérer vos inscriptions"}
                    </p>
                  </div>
                </div>

                <nav className="flex flex-col gap-2 text-sm">
                  {navItems.map((item) => {
                    const active = isActivePath(pathname, item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-4 py-2 transition",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                <Separator />

                <div className="flex items-center justify-between">
                  <ThemeToggle />
                  {!user ? (
                    <Button size="sm" asChild>
                      <Link href="/login">
                        <LogIn className="mr-2 h-4 w-4" />
                        Login
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => signOut()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Déconnexion
                    </Button>
                  )}
                </div>
                {user ? (
                  <Button asChild size="sm" variant="secondary">
                    <Link href="/me" className="flex items-center gap-2">
                      <UserCircleIcon className="h-4 w-4" />
                      Mon espace
                    </Link>
                  </Button>
                ) : null}
                {isAdmin ? (
                  <Button asChild size="sm" variant="secondary">
                    <Link href="/admin" className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Administration
                    </Link>
                  </Button>
                ) : null}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
