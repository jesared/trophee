"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, ImageIcon, Link2 } from "lucide-react";

import {
  PlaceAutocomplete,
  type PlaceValue,
} from "@/components/forms/PlaceAutocomplete";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OPEN_ADMIN_TOUR_CREATE_DIALOG_EVENT } from "@/lib/admin-events";

type ActionState = {
  ok: boolean;
  message: string;
};

type SeasonOption = {
  id: string;
  name: string;
  year: number;
  isActive: boolean;
};

type ClubOption = {
  id: string;
  name: string;
  city?: string | null;
};

type AdminTourCreateDialogProps = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  seasons: SeasonOption[];
  clubs: ClubOption[];
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? "Enregistrement..." : "Enregistrer"}
    </Button>
  );
}

export function AdminTourCreateDialog({
  action,
  seasons,
  clubs,
}: AdminTourCreateDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [place, setPlace] = React.useState<PlaceValue>({ value: "" });
  const [seasonId, setSeasonId] = React.useState("");
  const [clubId, setClubId] = React.useState("");
  const [coverUrl, setCoverUrl] = React.useState("");
  const [rulesUrl, setRulesUrl] = React.useState("");
  const [state, formAction] = React.useActionState(action, {
    ok: false,
    message: "",
  });
  const formRef = React.useRef<HTMLFormElement | null>(null);

  React.useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setPlace({ value: "" });
      setSeasonId("");
      setClubId("");
      setCoverUrl("");
      setRulesUrl("");
      setOpen(false);
    }
  }, [state.ok]);

  React.useEffect(() => {
    const handleOpen = () => setOpen(true);

    window.addEventListener(OPEN_ADMIN_TOUR_CREATE_DIALOG_EVENT, handleOpen);

    return () => {
      window.removeEventListener(
        OPEN_ADMIN_TOUR_CREATE_DIALOG_EVENT,
        handleOpen,
      );
    };
  }, []);

  const venueValue = place.place?.name ?? place.value;
  const cityValue = place.place?.city ?? "";
  const addressValue = place.place?.formatted_address ?? place.value;

  const hasSeason = seasons.length > 0;
  const hasClubs = clubs.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!hasSeason || !hasClubs}>Créer un tour</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[88vh] overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border/60 px-6 py-5 pr-14">
          <DialogTitle>Créer un tour</DialogTitle>
          <DialogDescription>
            Renseignez l&apos;organisation, la date, le lieu et les liens publics
            du nouveau tour.
          </DialogDescription>
        </DialogHeader>
        <form
          ref={formRef}
          action={formAction}
          className="flex max-h-[calc(88vh-88px)] flex-col"
        >
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
            <section className="space-y-4 rounded-2xl border border-border/60 bg-muted/20 p-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Organisation
                </h3>
                <p className="text-xs text-muted-foreground">
                  Identite du tour et rattachement administratif.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="create-season">Saison</Label>
                  <Select value={seasonId} onValueChange={setSeasonId}>
                    <SelectTrigger id="create-season">
                      <SelectValue placeholder="Choisir une saison" />
                    </SelectTrigger>
                    <SelectContent>
                      {seasons.map((season) => (
                        <SelectItem key={season.id} value={season.id}>
                          {season.name} ({season.year})
                          {season.isActive ? " active" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input type="hidden" name="seasonId" value={seasonId} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-club">Club organisateur</Label>
                  <Select value={clubId} onValueChange={setClubId}>
                    <SelectTrigger id="create-club">
                      <SelectValue placeholder="Choisir un club" />
                    </SelectTrigger>
                    <SelectContent>
                      {clubs.map((club) => (
                        <SelectItem key={club.id} value={club.id}>
                          {club.name}
                          {club.city ? ` (${club.city})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input type="hidden" name="clubId" value={clubId} />
                  {!hasClubs ? (
                    <p className="text-xs text-muted-foreground">
                      Créez un club pour activer la création de tour.
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-[1.5fr_0.9fr]">
                <div className="space-y-2">
                  <Label htmlFor="create-name">Nom du tour</Label>
                  <Input
                    id="create-name"
                    name="name"
                    placeholder="Tour decouverte"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-date">Date</Label>
                  <Input id="create-date" name="date" type="date" />
                </div>
              </div>
            </section>

            <section className="space-y-4 rounded-2xl border border-border/60 bg-muted/20 p-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Lieu</h3>
                <p className="text-xs text-muted-foreground">
                  Salle, ville et adresse affiches sur la page publique.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Salle</Label>
                <PlaceAutocomplete value={place} onChange={setPlace} />
                <input type="hidden" name="venue" value={venueValue} />
                <input type="hidden" name="city" value={cityValue} />
                <input type="hidden" name="address" value={addressValue} />
              </div>
              <div className="grid gap-3 rounded-xl border border-dashed border-border/70 bg-background/80 p-3 text-xs text-muted-foreground sm:grid-cols-2">
                <div>
                  <span className="block text-[11px] uppercase tracking-wide">
                    Ville
                  </span>
                  <span className="block pt-1 text-sm text-foreground">
                    {cityValue || "Aucune ville detectee"}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] uppercase tracking-wide">
                    Adresse
                  </span>
                  <span className="block pt-1 text-sm text-foreground">
                    {addressValue || "Aucune adresse renseignee"}
                  </span>
                </div>
              </div>
            </section>

            <section className="space-y-4 rounded-2xl border border-border/60 bg-muted/20 p-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Liens publics
                </h3>
                <p className="text-xs text-muted-foreground">
                  Ressources visibles par les joueurs sur la fiche tour.
                </p>
              </div>
              <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-2">
                  <Label htmlFor="create-cover">Couverture (URL)</Label>
                  <Input
                    id="create-cover"
                    name="coverUrl"
                    type="url"
                    placeholder="https://..."
                    value={coverUrl}
                    onChange={(event) => setCoverUrl(event.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Image ou affiche affichee en haut de la page du tour.
                  </p>
                  <div className="space-y-3">
                    {coverUrl ? (
                      <div className="relative aspect-[16/9] overflow-hidden rounded-[28px] border border-border/60 bg-background shadow-sm">
                        <Image
                          src={coverUrl}
                          alt="Apercu de la couverture"
                          fill
                          sizes="(max-width: 1023px) 100vw, 380px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-[16/9] items-center justify-center rounded-[28px] border border-dashed border-border/70 bg-muted/40 px-4 text-center text-xs text-muted-foreground">
                        Ajoutez une URL de couverture pour previsualiser
                        l&apos;image ici.
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-3 px-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        <span className="truncate">Apercu de la couverture</span>
                      </div>
                      {coverUrl ? (
                        <Button asChild size="xs" variant="ghost">
                          <Link href={coverUrl} target="_blank" rel="noreferrer">
                            Ouvrir
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-rules">Reglement (URL)</Label>
                    <Input
                      id="create-rules"
                      name="rulesUrl"
                      type="url"
                      placeholder="https://..."
                      value={rulesUrl}
                      onChange={(event) => setRulesUrl(event.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Lien public vers le PDF ou la page de reglement.
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-background/80 p-3">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <Link2 className="h-4 w-4" />
                      Liens ajoutes
                    </div>
                    <div className="mt-3 space-y-2 text-sm">
                      {coverUrl ? (
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="w-full justify-between"
                        >
                          <Link href={coverUrl} target="_blank" rel="noreferrer">
                            Voir la couverture
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Aucune couverture renseignee.
                        </p>
                      )}
                      {rulesUrl ? (
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="w-full justify-between"
                        >
                          <Link href={rulesUrl} target="_blank" rel="noreferrer">
                            Ouvrir le reglement
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Aucun reglement renseigne.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {state.message ? (
              <div
                className={
                  state.ok
                    ? "rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
                    : "rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                }
              >
                {state.message}
              </div>
            ) : null}
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-border/60 bg-background px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Le tour sera ajoute a la page publique et a l&apos;admin.
            </p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Annuler
              </Button>
              <SubmitButton
                disabled={
                  !hasSeason || !hasClubs || !venueValue || !seasonId || !clubId
                }
              />
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
