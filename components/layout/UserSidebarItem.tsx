"use client";

import { SidebarItem } from "@/components/layout/SidebarItem";

type UserSidebarItemProps = {
  href: string;
  label: string;
  icon: React.ElementType;
  active?: boolean;
  collapsed?: boolean;
};

export function UserSidebarItem(props: UserSidebarItemProps) {
  return <SidebarItem {...props} />;
}
