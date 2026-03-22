"use client";

import Link from "next/link";
import { ChevronDown, FileText, Folder } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ClassementFile = {
  id: string;
  name: string;
  modifiedTime?: string | null;
  webViewLink?: string | null;
  webContentLink?: string | null;
  size?: string | null;
};

export type ClassementSubfolder = {
  id: string;
  name: string;
  modifiedTime?: string | null;
  pdfs: ClassementFile[];
};

export type ClassementTour = {
  id: string;
  name: string;
  modifiedTime?: string | null;
  pdfs: ClassementFile[];
  subfolders: ClassementSubfolder[];
};

export type ClassementSeason = {
  id: string;
  name: string;
  modifiedTime?: string | null;
  rootPdfs: ClassementFile[];
  tours: ClassementTour[];
};

type ClassementExplorerProps = {
  seasons: ClassementSeason[];
};

const NEW_DAYS = 7;

function formatBytes(value?: string | null) {
  if (!value) return "-";
  const bytes = Number(value);
  if (Number.isNaN(bytes)) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let idx = 0;
  let size = bytes;
  while (size >= 1024 && idx < units.length - 1) {
    size /= 1024;
    idx += 1;
  }
  return `${size.toFixed(size >= 10 || idx === 0 ? 0 : 1)} ${units[idx]}`;
}

function isNewFile(modifiedTime?: string | null) {
  if (!modifiedTime) return false;
  const updated = new Date(modifiedTime).getTime();
  const now = Date.now();
  return now - updated <= NEW_DAYS * 24 * 60 * 60 * 1000;
}

function countAllPdfs(seasons: ClassementSeason[]) {
  return seasons.reduce((acc, season) => {
    const tourPdfs = season.tours.reduce(
      (sum, tour) => sum + tour.pdfs.length,
      0,
    );
    const nested = season.tours.reduce(
      (sum, tour) =>
        sum + tour.subfolders.reduce((s, sub) => s + sub.pdfs.length, 0),
      0,
    );
    return acc + season.rootPdfs.length + tourPdfs + nested;
  }, 0);
}

export function ClassementExplorer({ seasons }: ClassementExplorerProps) {
  const [openSeasonId, setOpenSeasonId] = React.useState<string | null>(
    seasons[0]?.id ?? null,
  );
  const [openTourId, setOpenTourId] = React.useState<string | null>(null);
  const [openSubfolderId, setOpenSubfolderId] = React.useState<string | null>(
    null,
  );

  const totalPdfs = countAllPdfs(seasons);
  const formatter = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const handleSeasonToggle = (id: string) => {
    setOpenSeasonId((prev) => (prev === id ? null : id));
    setOpenTourId(null);
    setOpenSubfolderId(null);
  };

  const handleTourToggle = (id: string) => {
    setOpenTourId((prev) => (prev === id ? null : id));
    setOpenSubfolderId(null);
  };

  const handleSubfolderToggle = (id: string) => {
    setOpenSubfolderId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Classement</h1>
          <p className="text-sm text-muted-foreground">
            Cliquez sur une saison puis un tour pour déplier les PDFs.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Saisons</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{seasons.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">PDFs</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{totalPdfs}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Dernière mise à jour</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {seasons[0]?.modifiedTime
              ? formatter.format(new Date(seasons[0].modifiedTime))
              : "-"}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {seasons.map((season) => {
          const isOpen = openSeasonId === season.id;
          const rootPdfs = season.rootPdfs;
          const tours = season.tours;

          return (
            <Card key={season.id}>
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => handleSeasonToggle(season.id)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                >
                  <div>
                    <CardTitle className="text-base">{season.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Tours : {tours.length} • PDFs racine : {season.rootPdfs.length}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      {season.modifiedTime
                        ? formatter.format(new Date(season.modifiedTime))
                        : "-"}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isOpen ? "rotate-180" : "rotate-0",
                      )}
                    />
                  </div>
                </button>
              </CardHeader>
              {isOpen ? (
                <CardContent className="space-y-4">
                  {rootPdfs.length > 0 ? (
                    <div className="rounded-lg border border-border/70 bg-background px-3 py-2">
                      <p className="text-xs font-semibold text-muted-foreground">
                        Classement général (racine)
                      </p>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {rootPdfs.map((file) => (
                          <div
                            key={file.id}
                            className="rounded-md border border-border/60 bg-muted/30 px-3 py-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2">
                                <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">{file.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {file.modifiedTime
                                      ? formatter.format(new Date(file.modifiedTime))
                                      : "-"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
                                <span>{formatBytes(file.size)}</span>
                                {isNewFile(file.modifiedTime) ? (
                                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                                    Nouveau
                                  </span>
                                ) : null}
                              </div>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {file.webViewLink ? (
                                <Button asChild size="sm" variant="secondary">
                                  <Link
                                    href={file.webViewLink}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    Ouvrir
                                  </Link>
                                </Button>
                              ) : null}
                              {file.webContentLink ? (
                                <Button asChild size="sm">
                                  <Link
                                    href={file.webContentLink}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    Télécharger
                                  </Link>
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {tours.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      Aucun tour trouvé.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tours.map((tour) => {
                        const tourOpen = openTourId === tour.id;
                        const tourPdfs = tour.pdfs;
                        return (
                          <div
                            key={tour.id}
                            className="rounded-lg border border-border/70 bg-background"
                          >
                            <button
                              type="button"
                              onClick={() => handleTourToggle(tour.id)}
                              className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold"
                            >
                              <span className="flex items-center gap-2">
                                <Folder className="h-4 w-4 text-muted-foreground" />
                                {tour.name}
                              </span>
                              <span className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
                                PDFs : {tour.pdfs.length} • Dossiers : {tour.subfolders.length}
                                <ChevronDown
                                  className={cn(
                                    "h-4 w-4 transition-transform",
                                    tourOpen ? "rotate-180" : "rotate-0",
                                  )}
                                />
                              </span>
                            </button>
                            {tourOpen ? (
                              <div className="border-t border-border/60 px-4 py-3">
                                {tourPdfs.length > 0 ? (
                                  <div className="mb-3 grid gap-2 sm:grid-cols-2">
                                    {tourPdfs.map((file) => (
                                      <div
                                        key={file.id}
                                        className="rounded-md border border-border/60 bg-muted/30 px-3 py-2"
                                      >
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="flex items-start gap-2">
                                            <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                            <div>
                                              <p className="text-sm font-medium">{file.name}</p>
                                              <p className="text-xs text-muted-foreground">
                                                {file.modifiedTime
                                                  ? formatter.format(new Date(file.modifiedTime))
                                                  : "-"}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
                                            <span>{formatBytes(file.size)}</span>
                                            {isNewFile(file.modifiedTime) ? (
                                              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                                                Nouveau
                                              </span>
                                            ) : null}
                                          </div>
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                          {file.webViewLink ? (
                                            <Button asChild size="sm" variant="secondary">
                                              <Link
                                                href={file.webViewLink}
                                                target="_blank"
                                                rel="noreferrer"
                                              >
                                                Ouvrir
                                              </Link>
                                            </Button>
                                          ) : null}
                                          {file.webContentLink ? (
                                            <Button asChild size="sm">
                                              <Link
                                                href={file.webContentLink}
                                                target="_blank"
                                                rel="noreferrer"
                                              >
                                                Télécharger
                                              </Link>
                                            </Button>
                                          ) : null}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : null}

                                {tour.subfolders.length === 0 ? (
                                  <div className="text-sm text-muted-foreground">
                                    Aucun sous-dossier supplémentaire.
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {tour.subfolders.map((sub) => {
                                      const subOpen = openSubfolderId === sub.id;
                                      const nestedPdfs = sub.pdfs;
                                      return (
                                        <div
                                          key={sub.id}
                                          className={cn(
                                            "rounded-lg border border-border/60 bg-background",
                                            subOpen && "ring-1 ring-primary/20",
                                          )}
                                        >
                                          <button
                                            type="button"
                                            onClick={() => handleSubfolderToggle(sub.id)}
                                            className="flex w-full items-center justify-between px-4 py-2 text-sm font-medium"
                                          >
                                            <span>{sub.name}</span>
                                            <span className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
                                              PDFs : {sub.pdfs.length}
                                              <ChevronDown
                                                className={cn(
                                                  "h-4 w-4 transition-transform",
                                                  subOpen ? "rotate-180" : "rotate-0",
                                                )}
                                              />
                                            </span>
                                          </button>
                                          {subOpen ? (
                                            <div className="border-t border-border/60 px-4 py-3">
                                              {nestedPdfs.length === 0 ? (
                                                <div className="text-sm text-muted-foreground">
                                                  Aucun PDF dans ce dossier.
                                                </div>
                                              ) : (
                                                <div className="grid gap-2 sm:grid-cols-2">
                                                  {nestedPdfs.map((file) => (
                                                    <div
                                                      key={file.id}
                                                      className="rounded-md border border-border/60 bg-muted/30 px-3 py-2"
                                                    >
                                                      <div className="flex items-start justify-between gap-2">
                                                        <div className="flex items-start gap-2">
                                                          <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                                          <div>
                                                            <p className="text-sm font-medium">{file.name}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                              {file.modifiedTime
                                                                ? formatter.format(new Date(file.modifiedTime))
                                                                : "-"}
                                                            </p>
                                                          </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
                                                          <span>{formatBytes(file.size)}</span>
                                                          {isNewFile(file.modifiedTime) ? (
                                                            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                                                              Nouveau
                                                            </span>
                                                          ) : null}
                                                        </div>
                                                      </div>
                                                      <div className="mt-2 flex flex-wrap gap-2">
                                                        {file.webViewLink ? (
                                                          <Button asChild size="sm" variant="secondary">
                                                            <Link
                                                              href={file.webViewLink}
                                                              target="_blank"
                                                              rel="noreferrer"
                                                            >
                                                              Ouvrir
                                                            </Link>
                                                          </Button>
                                                        ) : null}
                                                        {file.webContentLink ? (
                                                          <Button asChild size="sm">
                                                            <Link
                                                              href={file.webContentLink}
                                                              target="_blank"
                                                              rel="noreferrer"
                                                            >
                                                              Télécharger
                                                            </Link>
                                                          </Button>
                                                        ) : null}
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          ) : null}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              ) : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
