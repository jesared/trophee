import { unstable_cache } from "next/cache";

import { ClassementExplorer } from "@/components/classement-explorer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  classementDriveCacheTag,
  classementDriveRevalidateSeconds,
} from "@/lib/classement-cache";
import { listDriveChildren, listDriveFolders } from "@/lib/google-drive";

const pdfMime = "application/pdf";

export const dynamic = "force-dynamic";

type DriveFolder = Awaited<ReturnType<typeof listDriveFolders>>[number];
type DriveFile = Awaited<ReturnType<typeof listDriveChildren>>[number];

type ClassementDriveTree = {
  seasons: DriveFolder[];
  subfoldersBySeason: Record<string, DriveFolder[]>;
  subsubfoldersByTour: Record<string, DriveFolder[]>;
  pdfsBySeason: Record<string, DriveFile[]>;
  pdfsBySubfolder: Record<string, DriveFile[]>;
  pdfsBySubSubfolder: Record<string, DriveFile[]>;
};

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

const getCachedClassementDriveTree = unstable_cache(
  async (folderId: string): Promise<ClassementDriveTree> => {
    const seasons = sortByDateDesc(await listDriveFolders(folderId));

    const seasonEntries = await Promise.all(
      seasons.map(async (season) => [
        season.id,
        await listDriveFolders(season.id),
      ] as const),
    );
    const subfoldersBySeason = Object.fromEntries(seasonEntries);

    const seasonPdfEntries = await Promise.all(
      seasons.map(async (season) => [
        season.id,
        await listDriveChildren(season.id, { mimeType: pdfMime }),
      ] as const),
    );
    const pdfsBySeason = Object.fromEntries(seasonPdfEntries);

    const tourPdfEntries = await Promise.all(
      seasonEntries.flatMap(([, subfolders]) =>
        subfolders.map(async (sub) => [
          sub.id,
          await listDriveChildren(sub.id, { mimeType: pdfMime }),
        ] as const),
      ),
    );
    const pdfsBySubfolder = Object.fromEntries(tourPdfEntries);

    const subsubEntries = await Promise.all(
      seasonEntries.flatMap(([, subfolders]) =>
        subfolders.map(async (sub) => [
          sub.id,
          await listDriveFolders(sub.id),
        ] as const),
      ),
    );
    const subsubfoldersByTour = Object.fromEntries(subsubEntries);

    const subsubPdfEntries = await Promise.all(
      subsubEntries.flatMap(([, subsubs]) =>
        subsubs.map(async (sub) => [
          sub.id,
          await listDriveChildren(sub.id, { mimeType: pdfMime }),
        ] as const),
      ),
    );
    const pdfsBySubSubfolder = Object.fromEntries(subsubPdfEntries);

    return {
      seasons,
      subfoldersBySeason,
      subsubfoldersByTour,
      pdfsBySeason,
      pdfsBySubfolder,
      pdfsBySubSubfolder,
    };
  },
  ["classement-drive-tree"],
  {
    revalidate: classementDriveRevalidateSeconds,
    tags: [classementDriveCacheTag],
  },
);

export default async function ClassementPage() {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID ?? "";

  let error: string | null = null;
  let driveTree: ClassementDriveTree = {
    seasons: [],
    subfoldersBySeason: {},
    subsubfoldersByTour: {},
    pdfsBySeason: {},
    pdfsBySubfolder: {},
    pdfsBySubSubfolder: {},
  };

  if (!folderId) {
    error = "GOOGLE_DRIVE_FOLDER_ID manquant.";
  } else {
    try {
      driveTree = await getCachedClassementDriveTree(folderId);
    } catch (err) {
      error = err instanceof Error ? err.message : "Erreur inconnue.";
    }
  }

  if (error) {
    return (
      <section className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Classement</h1>
          <p className="text-sm text-muted-foreground">
            Classements PDF par saison et par sous-dossier.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Configuration manquante</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {error}
          </CardContent>
        </Card>
      </section>
    );
  }

  const {
    seasons,
    subfoldersBySeason,
    subsubfoldersByTour,
    pdfsBySeason,
    pdfsBySubfolder,
    pdfsBySubSubfolder,
  } = driveTree;

  const seasonsView = seasons.map((season) => {
    const tours = sortTourDesc(subfoldersBySeason[season.id] ?? []).map(
      (tour) => ({
        ...tour,
        pdfs: sortByDateDesc(pdfsBySubfolder[tour.id] ?? []),
        subfolders: sortByDateDesc(subsubfoldersByTour[tour.id] ?? []).map(
          (sub) => ({
            ...sub,
            pdfs: sortByDateDesc(pdfsBySubSubfolder[sub.id] ?? []),
          }),
        ),
      }),
    );

    return {
      ...season,
      rootPdfs: sortByDateDesc(pdfsBySeason[season.id] ?? []),
      tours,
    };
  });

  return (
    <section className="page">
      <ClassementExplorer seasons={seasonsView} />
    </section>
  );
}
