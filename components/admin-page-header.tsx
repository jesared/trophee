import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

type AdminPageHeaderProps = {
  badge?: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function AdminPageHeader({
  badge = "Administration",
  title,
  description,
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-3">
        <Badge variant="secondary" className="w-fit">
          {badge}
        </Badge>
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-bold tracking-[-0.045em] text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
