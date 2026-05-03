import { ImageIcon } from "lucide-react";

import { AdminMediaUpload } from "@/components/admin-media-upload";
import { AdminMediaList } from "@/components/admin-media-list";
import { AdminMediaSortBar } from "@/components/admin-media-sort-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  getMediaFolders,
  isCloudinaryConfigured,
  listCloudinaryFolder,
} from "@/lib/cloudinary-admin";

type MediaFile = {
  name: string;
  path: string;
  size?: number | null;
  updatedAt?: string | null;
  url?: string | null;
};

const MEDIA_FOLDERS = getMediaFolders();

async function loadMediaByFolder(): Promise<
  { label: string; value: string; files: MediaFile[] }[]
> {
  try {
    const sections = await Promise.all(
      MEDIA_FOLDERS.map(async (folder) => {
        const files = (await listCloudinaryFolder(folder.value)).map((item) => {
          const name = item.public_id.split("/").pop() ?? item.public_id;
          return {
            name: item.format ? `${name}.${item.format}` : name,
            path: item.public_id,
            size: item.bytes ?? null,
            updatedAt: item.created_at ?? null,
            url: item.secure_url ?? null,
          };
        });

        return { ...folder, files };
      }),
    );
    return sections;
  } catch {
    return MEDIA_FOLDERS.map((folder) => ({ ...folder, files: [] }));
  }
}

type SortKey = "date" | "name" | "size";

export default async function AdminMediasPage({
  searchParams,
}: {
  searchParams?: Promise<{ sort?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const envMissing = !isCloudinaryConfigured();

  const mediaSections = envMissing ? [] : await loadMediaByFolder();
  const sortParam = resolvedSearchParams?.sort;
  const sortKey: SortKey =
    sortParam === "name" || sortParam === "size" || sortParam === "date"
      ? sortParam
      : "date";
  const sortedSections = mediaSections.map((section) => {
    const files = [...section.files];
    files.sort((a, b) => {
      if (sortKey === "name") {
        return a.name.localeCompare(b.name, "fr");
      }
      if (sortKey === "size") {
        return (b.size ?? 0) - (a.size ?? 0);
      }
      const aDate = a.updatedAt ? Date.parse(a.updatedAt) : 0;
      const bDate = b.updatedAt ? Date.parse(b.updatedAt) : 0;
      return bDate - aDate;
    });
    return { ...section, files };
  });
  const totalMedias = mediaSections.reduce(
    (acc, section) => acc + section.files.length,
    0,
  );

  const sectionCounts = sortedSections.map((section) => ({
    label: section.label,
    count: section.files.length,
  }));

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Medias</h1>
        <p className="text-sm text-muted-foreground">
          Centralisez vos visuels officiels (affiches, logos, photos).
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {sectionCounts.map((section) => (
          <Card key={section.label} className="border-border/60">
            <CardContent className="space-y-1 pt-4">
              <p className="text-xs text-muted-foreground">{section.label}</p>
              <p className="text-xl font-semibold text-foreground">
                {section.count}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {envMissing ? (
        <Card className="border-destructive/30 bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-base text-destructive">
              Configuration Cloudinary manquante
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Ajoutez `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` et
            `CLOUDINARY_API_SECRET` dans le fichier .env pour activer la
            galerie.
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Uploader une image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AdminMediaUpload folders={MEDIA_FOLDERS} />
            <Separator />
            <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              Les images sont stockees sur Cloudinary et pretes a etre
              reutilisees dans vos contenus.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Bibliotheque</CardTitle>
            <Badge variant="secondary">{totalMedias} fichiers</Badge>
          </CardHeader>
          <CardContent>
            <AdminMediaSortBar sort={sortKey} />
            {totalMedias === 0 ? (
              <div className="surface flex flex-col items-center gap-3 px-6 py-10 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    Aucune image pour le moment
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Commencez par uploader vos visuels.
                  </p>
                </div>
              </div>
            ) : (
              <AdminMediaList sections={sortedSections} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
