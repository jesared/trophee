"use client";

import { SidebarItem } from "@/components/layout/SidebarItem";

type UserSidebarItemProps = {
  href: string;
  label: string;
  icon: React.ElementType;
  active?: boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
};

export function UserSidebarItem(props: UserSidebarItemProps) {
  return <SidebarItem {...props} />;
}
