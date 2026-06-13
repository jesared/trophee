"use client";

import {
  BarChart3,
  CalendarDays,
  Home,
  LogOut,
  Menu,
  Shield,
  Trophy,
  UserCircleIcon,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
  SheetFooter,
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
];

type HeaderUser = {
  email?: string | null;
  image?: string | null;
  name?: string | null;
  role?: string | null;
};

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname.startsWith(href);
}

function getInitials(name?: string | null) {
  if (!name) {
    return "U";
  }

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function UserAvatarMenu({
  isAdmin,
  user,
}: {
  isAdmin: boolean;
  user: HeaderUser;
}) {
  const initials = getInitials(user.name);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 rounded-full px-2.5">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user.image ?? ""}
              alt={user.name ?? "Utilisateur"}
            />
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
              Administration
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

function HeaderAuthActions({
  isAdmin,
  mobile = false,
  onNavigate,
  user,
}: {
  isAdmin: boolean;
  mobile?: boolean;
  onNavigate?: () => void;
  user?: HeaderUser;
}) {
  if (!user) {
    return (
      <Button
        asChild
        variant="cta"
        size="sm"
        className={cn(
          "px-4 font-bold tracking-[-0.01em]",
          mobile && "w-full justify-center",
        )}
      >
        <Link href="/login" aria-label="se connecter" onClick={onNavigate}>
          C&apos;est parti !
        </Link>
      </Button>
    );
  }

  if (!mobile) {
    return <UserAvatarMenu user={user} isAdmin={isAdmin} />;
  }

  return (
    <>
      <Button
        asChild
        size="sm"
        variant="secondary"
        className="w-full justify-start"
      >
        <Link href="/me" className="flex items-center gap-2" onClick={onNavigate}>
          <UserCircleIcon className="h-4 w-4" />
          Mon espace
        </Link>
      </Button>
      {isAdmin ? (
        <Button
          asChild
          size="sm"
          variant="secondary"
          className="w-full justify-start"
        >
          <Link
            href="/admin"
            className="flex items-center gap-2"
            onClick={onNavigate}
          >
            <Shield className="h-4 w-4" />
            Administration
          </Link>
        </Button>
      ) : null}
      <Button
        size="sm"
        variant="secondary"
        className="w-full justify-start"
        onClick={() => signOut()}
      >
        <LogOut className="h-4 w-4" />
        Déconnexion
      </Button>
    </>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { data } = useSession();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const user = data?.user;
  const initials = getInitials(user?.name);
  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="app-header-shell">
      <div className="app-header-strip">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-2.5 text-xs text-muted-foreground">
          <span>
            Consultez l&apos;agenda, les salles et les classements de la saison.
          </span>
          <Link
            href="/agenda"
            className="hidden font-semibold text-foreground transition-colors hover:text-primary sm:inline-flex"
          >
            Voir l&apos;agenda
          </Link>
        </div>
      </div>
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/15 bg-primary text-sm font-bold tracking-[-0.04em] text-primary-foreground shadow-sm">
              FG
            </span>
            <span className="space-y-0.5">
              <span className="block text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Circuit régional
              </span>
              <span className="block font-heading text-base font-bold tracking-[-0.04em] text-foreground">
                Trophée FG
              </span>
            </span>
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "nav-chip hover:border-primary/15 hover:bg-accent/20 hover:text-foreground",
                    active && "nav-chip-active",
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
            <HeaderAuthActions user={user} isAdmin={isAdmin} />
          </div>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Ouvrir le menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-80 border-border/70 bg-background/95 backdrop-blur-xl"
            >
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Accès rapide aux pages principales.
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-1 flex-col px-4 pb-4">
                <Card size="sm" className="mt-2 shadow-none">
                  <CardContent className="flex items-center gap-3">
                    {user ? (
                      <>
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={user.image ?? ""}
                            alt={user.name ?? "Utilisateur"}
                          />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {user.name ?? "Utilisateur"}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {user.email ?? "Compte connecté"}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Accès public</p>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          Consultez l&apos;agenda, les tours et les classements.
                          Connectez-vous pour accéder à votre espace joueur.
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Apparence</p>
                      <p className="text-xs text-muted-foreground">
                        Basculer entre les thèmes clair et sombre
                      </p>
                    </div>
                    <ThemeToggle />
                  </CardFooter>
                </Card>

                <nav className="mt-6 flex flex-col gap-2 text-sm">
                  {navItems.map((item) => {
                    const active = isActivePath(pathname, item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 font-semibold tracking-[-0.02em] transition",
                          active
                            ? "border-primary/20 bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:border-primary/10 hover:bg-accent/20 hover:text-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>

                <Separator className="my-6" />

                <SheetFooter className="gap-2 p-0">
                  <HeaderAuthActions
                    mobile
                    user={user}
                    isAdmin={isAdmin}
                    onNavigate={() => setMobileOpen(false)}
                  />
                </SheetFooter>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
