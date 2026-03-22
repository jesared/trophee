import { revalidatePath } from "next/cache";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

async function createSeason(formData: FormData) {
  "use server";

  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const yearValue = String(formData.get("year") ?? "").trim();

  if (!name || !yearValue) {
    return;
  }

  const year = Number(yearValue);

  if (Number.isNaN(year)) {
    return;
  }

  await prisma.season.create({
    data: {
      name,
      year,
    },
  });

  revalidatePath("/admin/seasons");
}

async function activateSeason(formData: FormData) {
  "use server";

  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    return;
  }

  await prisma.$transaction([
    prisma.season.updateMany({
      data: { isActive: false },
    }),
    prisma.season.update({
      where: { id },
      data: { isActive: true },
    }),
  ]);

  revalidatePath("/admin/seasons");
}

export default async function AdminSeasonsPage() {
  await requireAdmin();

  type SeasonItem = {
    id: string;
    name: string;
    year: number;
    isActive: boolean;
  };

  const seasons: SeasonItem[] = await prisma.season.findMany({
    orderBy: { year: "desc" },
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Seasons</h1>
        <p className="text-sm text-muted-foreground">
          Creez vos saisons et definissez la saison active.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="rounded-lg border border-border bg-background p-4">
          <form action={createSeason} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input id="name" name="name" placeholder="Saison 2026" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Annee</Label>
              <Input id="year" name="year" type="number" placeholder="2026" />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Creer une saison</Button>
            </div>
          </form>
        </div>

        <div className="rounded-lg border border-border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Annee</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {seasons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center">
                    Aucune saison pour le moment.
                  </TableCell>
                </TableRow>
              ) : (
                seasons.map((season: SeasonItem) => (
                  <TableRow key={season.id}>
                    <TableCell className="font-medium">
                      {season.name}
                    </TableCell>
                    <TableCell>{season.year}</TableCell>
                    <TableCell>
                      {season.isActive ? (
                        <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground ring-1 ring-inset ring-border">
                          Inactive
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {season.isActive ? (
                        <Button variant="outline" size="sm" disabled>
                          Active
                        </Button>
                      ) : (
                        <form action={activateSeason}>
                          <input type="hidden" name="id" value={season.id} />
                          <Button size="sm">Activer</Button>
                        </form>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
