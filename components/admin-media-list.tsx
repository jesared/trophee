"use client";

import * as React from "react";
import { ImageIcon } from "lucide-react";

import { AdminMediaBulkActions } from "@/components/admin-media-bulk-actions";
import { AdminMediaCopyButton } from "@/components/admin-media-copy-button";
import { AdminMediaDeleteButton } from "@/components/admin-media-delete-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MediaFile = {
  name: string;
  path: string;
  size?: number | null;
  updatedAt?: string | null;
  url?: string | null;
};

type MediaSection = {
  label: string;
  value: string;
  files: MediaFile[];
};

export function AdminMediaList({ sections }: { sections: MediaSection[] }) {
  const [selected, setSelected] = React.useState<string[]>([]);

  const allPaths = React.useMemo(
    () => sections.flatMap((section) => section.files.map((file) => file.path)),
    [sections],
  );

  React.useEffect(() => {
    setSelected((prev) => prev.filter((item) => allPaths.includes(item)));
  }, [allPaths]);

  const toggle = (path: string) => {
    setSelected((prev) =>
      prev.includes(path) ? prev.filter((item) => item !== path) : [...prev, path],
    );
  };

  const selectAll = () => {
    setSelected(allPaths);
  };

  const clear = () => {
    setSelected([]);
  };

  const isAllSelected = selected.length > 0 && selected.length === allPaths.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={selectAll}
            disabled={allPaths.length === 0 || isAllSelected}
          >
            Tout selectionner
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clear}
            disabled={selected.length === 0}
          >
            Vider la selection
          </Button>
          <span className="text-xs text-muted-foreground">
            {selected.length} selectionne(s)
          </span>
        </div>
        <AdminMediaBulkActions selected={selected} onClear={clear} />
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.value} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">{section.label}</h3>
              <Badge variant="outline">{section.files.length} fichiers</Badge>
            </div>
            {section.files.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-center text-xs text-muted-foreground">
                Aucun media dans ce dossier.
              </div>
            ) : (
              <div className="divide-y divide-border/60 rounded-lg border border-border/60 bg-background">
                {section.files.map((media) => {
                  const checked = selected.includes(media.path);
                  return (
                    <div
                      key={media.path}
                      className={cn(
                        "flex flex-col gap-3 px-4 py-3 transition hover:bg-muted/20 sm:flex-row sm:items-center",
                        checked && "bg-primary/5",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-border"
                          checked={checked}
                          onChange={() => toggle(media.path)}
                        />
                        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted/30">
                          {media.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={media.url}
                              alt={media.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {media.name}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            {media.size
                              ? `${Math.round(media.size / 1024)} Ko`
                              : "Taille inconnue"}
                            {media.updatedAt
                              ? ` • ${new Date(media.updatedAt).toLocaleDateString(
                                  "fr-FR",
                                )}`
                              : ""}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 sm:ml-auto">
                        {media.url ? (
                          <Button asChild variant="secondary" size="sm">
                            <a
                              href={media.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Telecharger
                            </a>
                          </Button>
                        ) : null}
                        <AdminMediaCopyButton url={media.url} />
                        <AdminMediaDeleteButton name={media.path} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
