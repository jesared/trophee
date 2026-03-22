import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listDriveChildren, listDriveFolders } from "@/lib/google-drive";

const pdfMime = "application/pdf";

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

function sortByDateDesc<T extends { modifiedTime?: string | null }>(items: T[]) {
  return [...items].sort((a, b) => {
    const aTime = a.modifiedTime ? new Date(a.modifiedTime).getTime() : 0;
    const bTime = b.modifiedTime ? new Date(b.modifiedTime).getTime() : 0;
    return bTime - aTime;
  });
}

function extractTourNumber(name: string) {
  const match = name.toLowerCase().match(/tour\s*(\d+)/);
  return match ? Number(match[1]) : null;
}

function sortTourDesc<T extends { name: string }>(items: T[]) {
  return [...items].sort((a, b) => {
    const aNum = extractTourNumber(a.name);
    const bNum = extractTourNumber(b.name);
    if (aNum != null && bNum != null) {
      return bNum - aNum;
    }
    if (aNum != null) return -1;
    if (bNum != null) return 1;
    return a.name.localeCompare(b.name, "fr", { sensitivity: "base" });
  });
}

export default async function ClassementPage() {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID ?? "";

  let seasons: Awaited<ReturnType<typeof listDriveFolders>> = [];
  let subfoldersBySeason: Record<string, Awaited<ReturnType<typeof listDriveFolders>>> = {};
  let pdfsBySubfolder: Record<string, Awaited<ReturnType<typeof listDriveChildren>>> = {};
  let pdfsBySeason: Record<string, Awaited<ReturnType<typeof listDriveChildren>>> = {};
  let error: string | null = null;

  if (!folderId) {
    error = "GOOGLE_DRIVE_FOLDER_ID manquant.";
  } else {
    try {
      seasons = await listDriveFolders(folderId);

      const seasonEntries = await Promise.all(
        seasons.map(async (season) => [
          season.id,
          await listDriveFolders(season.id),
        ] as const),
      );
      subfoldersBySeason = Object.fromEntries(seasonEntries);

      const seasonPdfEntries = await Promise.all(
        seasons.map(async (season) => [
          season.id,
          await listDriveChildren(season.id, { mimeType: pdfMime }),
        ] as const),
      );
      pdfsBySeason = Object.fromEntries(seasonPdfEntries);

      const pdfEntries = await Promise.all(
        seasonEntries.flatMap(([, subfolders]) =>
          subfolders.map(async (sub) => [
            sub.id,
            await listDriveChildren(sub.id, { mimeType: pdfMime }),
          ] as const),
        ),
      );
      pdfsBySubfolder = Object.fromEntries(pdfEntries);
    } catch (err) {
      error = err instanceof Error ? err.message : "Erreur inconnue.";
    }
  }

  const formatter = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Classement</h1>
        <p className="text-sm text-muted-foreground">
          Classements PDF par saison et par sous-dossier.
        </p>
      </div>

      {error ? (
        <Card>
          <CardHeader>
            <CardTitle>Configuration manquante</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {error}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {seasons.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Aucun dossier de saison trouvé.
              </CardContent>
            </Card>
          ) : (
            sortByDateDesc(seasons).map((season) => {
              const subfolders = sortTourDesc(
                subfoldersBySeason[season.id] ?? [],
              );
              const rootPdfs = sortByDateDesc(pdfsBySeason[season.id] ?? []);

              return (
                <Card key={season.id}>
                  <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-base">{season.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Sous-dossiers : {subfolders.length} • PDFs racine : {rootPdfs.length}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {season.modifiedTime
                        ? formatter.format(new Date(season.modifiedTime))
                        : "-"}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {rootPdfs.length > 0 ? (
                      <div className="rounded-lg border border-border/70 bg-background px-3 py-2">
                        <p className="text-xs font-semibold text-muted-foreground">
                          Classement général (racine)
                        </p>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          {rootPdfs.map((file) => (
                            <div key={file.id} className="rounded-md border border-border/60 bg-muted/30 px-3 py-2">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-medium">{file.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {file.modifiedTime
                                      ? formatter.format(new Date(file.modifiedTime))
                                      : "-"}
                                  </p>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {formatBytes(file.size)}
                                </span>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {file.webViewLink ? (
                                  <Button asChild size="sm" variant="secondary">
                                    <Link href={file.webViewLink} target="_blank" rel="noreferrer">
                                      Ouvrir
                                    </Link>
                                  </Button>
                                ) : null}
                                {file.webContentLink ? (
                                  <Button asChild size="sm">
                                    <Link href={file.webContentLink} target="_blank" rel="noreferrer">
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

                    {subfolders.length === 0 ? (
                      <div className="text-sm text-muted-foreground">
                        Aucun sous-dossier trouvé.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {subfolders.map((sub) => {
                          const pdfs = sortByDateDesc(pdfsBySubfolder[sub.id] ?? []);
                          return (
                            <details key={sub.id} className="group rounded-lg border border-border/70 bg-background">
                              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold">
                                <span>{sub.name}</span>
                                <span className="text-xs font-normal text-muted-foreground">
                                  PDFs : {pdfs.length}
                                </span>
                              </summary>
                              <div className="border-t border-border/60 px-4 py-3">
                                {pdfs.length === 0 ? (
                                  <div className="text-sm text-muted-foreground">
                                    Aucun PDF dans ce sous-dossier.
                                  </div>
                                ) : (
                                  <div className="grid gap-2 sm:grid-cols-2">
                                    {pdfs.map((file) => (
                                      <div
                                        key={file.id}
                                        className="rounded-md border border-border/60 bg-muted/30 px-3 py-2"
                                      >
                                        <div className="flex items-start justify-between gap-2">
                                          <div>
                                            <p className="text-sm font-medium">{file.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                              {file.modifiedTime
                                                ? formatter.format(new Date(file.modifiedTime))
                                                : "-"}
                                            </p>
                                          </div>
                                          <span className="text-xs text-muted-foreground">
                                            {formatBytes(file.size)}
                                          </span>
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
                            </details>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}
    </section>
  );
}
