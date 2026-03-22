import { revalidatePath } from "next/cache";
import { z } from "zod";

import { AdminDeleteForm } from "@/components/admin-delete-form";
import { AdminPlayerDialog } from "@/components/admin-player-dialog";
import { AdminPlayerImport } from "@/components/admin-player-import";
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

type ActionState = {
  ok: boolean;
  message: string;
};

const pointsSchema = z.preprocess((value) => {
  if (value === null || value === undefined) {
    return undefined;
  }
  const parsed = String(value).trim();
  if (!parsed) {
    return undefined;
  }
  const numeric = Number(parsed);
  if (Number.isNaN(numeric)) {
    return value;
  }
  return numeric;
}, z.number().int().optional());

const playerSchema = z.object({
  firstName: z.string().min(2, "Prenom requis."),
  lastName: z.string().min(2, "Nom requis."),
  email: z.string().email("Email invalide.").optional().or(z.literal("")),
  club: z.string().optional().or(z.literal("")),
  points: pointsSchema,
  licence: z.string().optional().or(z.literal("")),
});

const normalizeHeader = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_\s-]+/g, "");

const headerMap: Record<string, string> = {
  firstname: "firstName",
  prenom: "firstName",
  first_name: "firstName",
  lastname: "lastName",
  nom: "lastName",
  last_name: "lastName",
  email: "email",
  mail: "email",
  club: "club",
  points: "points",
  licence: "licence",
  license: "licence",
};

function splitCsvLine(line: string, delimiter: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values.map((value) => value.trim());
}

function parseCsv(text: string) {
  const rows = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (rows.length === 0) {
    return { ok: false as const, message: "Fichier vide." };
  }

  const headerLine = rows[0].replace(/^\uFEFF/, "");
  const delimiter =
    (headerLine.match(/;/g)?.length ?? 0) >=
    (headerLine.match(/,/g)?.length ?? 0)
      ? ";"
      : ",";

  const rawHeaders = splitCsvLine(headerLine, delimiter);
  const headers = rawHeaders.map((header) => {
    const normalized = normalizeHeader(header);
    return headerMap[normalized] ?? headerMap[normalized.replace(/\s/g, "")] ?? "";
  });

  if (!headers.includes("firstName") || !headers.includes("lastName")) {
    return {
      ok: false as const,
      message: "Colonnes obligatoires manquantes (firstName, lastName).",
    };
  }

  const data = rows.slice(1).map((line) => {
    const values = splitCsvLine(line, delimiter);
    const record: Record<string, string> = {};

    headers.forEach((key, index) => {
      if (!key) {
        return;
      }
      record[key] = values[index] ?? "";
    });

    return record;
  });

  return { ok: true as const, data };
}

async function createPlayer(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  "use server";

  await requireAdmin();

  const parsed = playerSchema.safeParse({
    firstName: String(formData.get("firstName") ?? "").trim(),
    lastName: String(formData.get("lastName") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    club: String(formData.get("club") ?? "").trim(),
    points: formData.get("points"),
    licence: String(formData.get("licence") ?? "").trim(),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Donnees invalides.",
    };
  }

  const { firstName, lastName, email, club, points, licence } = parsed.data;

  await prisma.player.create({
    data: {
      firstName,
      lastName,
      email: email || null,
      club: club || null,
      points: points ?? null,
      licence: licence || null,
    },
  });

  revalidatePath("/admin/players");

  return { ok: true, message: "Joueur cree." };
}

async function importPlayers(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  "use server";

  await requireAdmin();

  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Fichier CSV requis." };
  }

  const text = await file.text();
  const parsedCsv = parseCsv(text);

  if (!parsedCsv.ok) {
    return { ok: false, message: parsedCsv.message };
  }

  const rows = parsedCsv.data;
  const prepared = [] as Array<{
    firstName: string;
    lastName: string;
    email?: string | null;
    club?: string | null;
    points?: number | null;
    licence?: string | null;
  }>;

  let skipped = 0;

  for (const row of rows) {
    const parsed = playerSchema.safeParse({
      firstName: String(row.firstName ?? "").trim(),
      lastName: String(row.lastName ?? "").trim(),
      email: String(row.email ?? "").trim(),
      club: String(row.club ?? "").trim(),
      points: row.points ?? "",
      licence: String(row.licence ?? "").trim(),
    });

    if (!parsed.success) {
      skipped += 1;
      continue;
    }

    const { firstName, lastName, email, club, points, licence } = parsed.data;

    prepared.push({
      firstName,
      lastName,
      email: email || null,
      club: club || null,
      points: points ?? null,
      licence: licence || null,
    });
  }

  if (prepared.length === 0) {
    return { ok: false, message: "Aucun joueur valide a importer." };
  }

  const result = await prisma.player.createMany({
    data: prepared,
    skipDuplicates: true,
  });

  revalidatePath("/admin/players");

  const total = rows.length;
  const created = result.count;
  const ignored = total - created;

  return {
    ok: true,
    message: `Import termine: ${created} ajoutes, ${ignored} ignores.`,
  };
}

async function deletePlayer(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  "use server";

  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    return { ok: false, message: "Joueur introuvable." };
  }

  await prisma.player.delete({
    where: { id },
  });

  revalidatePath("/admin/players");

  return { ok: true, message: "Joueur supprime." };
}

export default async function AdminPlayersPage() {
  await requireAdmin();

  const players = await prisma.player.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Joueurs</h1>
          <p className="text-sm text-muted-foreground">
            Gere les profils des joueurs inscrits.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <AdminPlayerImport action={importPlayers} />
          <AdminPlayerDialog action={createPlayer} />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Club</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Licence</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center">
                  Aucun joueur pour le moment.
                </TableCell>
              </TableRow>
            ) : (
              players.map((player) => (
                <TableRow key={player.id}>
                  <TableCell className="font-medium">
                    {player.firstName} {player.lastName}
                  </TableCell>
                  <TableCell>{player.club ?? "-"}</TableCell>
                  <TableCell>{player.points ?? "-"}</TableCell>
                  <TableCell>{player.email ?? "-"}</TableCell>
                  <TableCell>{player.licence ?? "-"}</TableCell>
                  <TableCell className="text-right">
                    <AdminDeleteForm id={player.id} action={deletePlayer} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
