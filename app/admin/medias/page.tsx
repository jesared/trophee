import { ImageIcon } from "lucide-react";

import { AdminMediaUpload } from "@/components/admin-media-upload";
import { AdminMediaList } from "@/components/admin-media-list";
import { AdminMediaSortBar } from "@/components/admin-media-sort-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getSupabaseAdmin, getSupabaseBucket } from "@/lib/supabase-admin";

type MediaFile = {
  name: string;
  path: string;
  size?: number | null;
  updatedAt?: string | null;
  url?: string | null;
};

const IMAGE_REGEX = /\.(png|jpe?g|webp|gif|svg)$/i;
const MEDIA_FOLDERS = [
  { label: "Logos", value: "logos" },
  { label: "Affiches", value: "affiches" },
  { label: "Photos", value: "photos" },
  { label: "Autres", value: "autres" },
];

async function loadMediaByFolder(): Promise<
  { label: string; value: string; files: MediaFile[] }[]
> {
  try {
    const supabase = getSupabaseAdmin();
    const bucket = getSupabaseBucket();

    const sections = await Promise.all(
      MEDIA_FOLDERS.map(async (folder) => {
        const { data } = await supabase.storage.from(bucket).list(folder.value, {
          limit: 200,
          sortBy: { column: "name", order: "desc" },
        });

        const files = (data ?? [])
          .filter((item) => IMAGE_REGEX.test(item.name))
          .map((item) => ({
            name: item.name,
            path: `${folder.value}/${item.name}`,
            size: item.metadata?.size ?? null,
            updatedAt: item.updated_at ?? item.created_at ?? null,
          }));

        return { ...folder, files };
      }),
    );

    const allFiles = sections.flatMap((section) => section.files);
    if (allFiles.length === 0) {
      return sections;
    }

    const { data: signed } = await supabase.storage
      .from(bucket)
      .createSignedUrls(
        allFiles.map((item) => item.path),
        60 * 60,
      );

    const signedMap = new Map(
      signed?.map((entry) => [entry.path, entry.signedUrl]) ?? [],
    );

    return sections.map((section) => ({
      ...section,
      files: section.files.map((file) => ({
        ...file,
        url: signedMap.get(file.path) ?? null,
      })),
    }));
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
  const envMissing =
    !process.env.SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    !process.env.SUPABASE_STORAGE_BUCKET;

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
              Configuration Supabase manquante
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Ajoutez `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` et
            `SUPABASE_STORAGE_BUCKET` dans le fichier .env pour activer la
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
              Les images sont stockees dans le bucket Supabase defini dans votre
              .env.
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
