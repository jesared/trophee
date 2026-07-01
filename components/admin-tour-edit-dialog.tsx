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

type TourEditItem = {
  id: string;
  name: string;
  date: Date | string;
  seasonId: string;
  clubId: string | null;
  venue: string | null;
  city: string | null;
  address: string | null;
  coverUrl: string | null;
  rulesUrl: string | null;
};

type AdminTourEditDialogProps = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  seasons: SeasonOption[];
  clubs: ClubOption[];
  tour: TourEditItem;
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function toDateInputValue(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toISOString().slice(0, 10);
}

function buildInitialPlace(tour: TourEditItem): PlaceValue {
  return {
    value: tour.venue ?? tour.address ?? "",
    place:
      tour.venue || tour.address || tour.city
        ? {
            name: tour.venue ?? tour.address ?? "",
            formatted_address: tour.address ?? tour.venue ?? "",
            city: tour.city ?? "",
            latitude: null,
            longitude: null,
          }
        : undefined,
  };
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? "Enregistrement..." : "Enregistrer"}
    </Button>
  );
}

export function AdminTourEditDialog({
  action,
  seasons,
  clubs,
  tour,
  trigger,
  defaultOpen,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: AdminTourEditDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false);
  const [state, formAction] = React.useActionState(action, {
    ok: false,
    message: "",
  });
  const [seasonId, setSeasonId] = React.useState(tour.seasonId);
  const [clubId, setClubId] = React.useState(tour.clubId ?? "");
  const [place, setPlace] = React.useState<PlaceValue>(() => buildInitialPlace(tour));
  const [coverUrl, setCoverUrl] = React.useState(tour.coverUrl ?? "");
  const [rulesUrl, setRulesUrl] = React.useState(tour.rulesUrl ?? "");
  const formRef = React.useRef<HTMLFormElement | null>(null);
  const open = controlledOpen ?? internalOpen;
  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      controlledOnOpenChange?.(nextOpen);
      if (controlledOpen === undefined) {
        setInternalOpen(nextOpen);
      }
    },
    [controlledOnOpenChange, controlledOpen],
  );

  React.useEffect(() => {
    if (controlledOpen === undefined && defaultOpen) {
      setInternalOpen(true);
    }
  }, [controlledOpen, defaultOpen]);

  React.useEffect(() => {
    if (!open) {
      setSeasonId(tour.seasonId);
      setClubId(tour.clubId ?? "");
      setPlace(buildInitialPlace(tour));
      setCoverUrl(tour.coverUrl ?? "");
      setRulesUrl(tour.rulesUrl ?? "");
      formRef.current?.reset();
    }
  }, [open, tour]);

  React.useEffect(() => {
    if (state.ok) {
      setOpen(false);
    }
  }, [setOpen, state.ok]);

  const venueValue = place.place?.name ?? place.value;
  const cityValue = place.place?.city ?? tour.city ?? "";
  const addressValue =
    place.place?.formatted_address ??
    (place.value ? place.value : (tour.address ?? ""));

  const hasSeason = seasons.length > 0;
  const hasClubs = clubs.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      ) : null}
      <DialogContent className="max-h-[88vh] overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border/60 px-6 py-5 pr-14">
          <DialogTitle>Modifier le tour</DialogTitle>
          <DialogDescription>
            Mettez a jour l&apos;organisation, la date, le lieu et les liens publics de{" "}
            <span className="font-medium text-foreground">{tour.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <form
          ref={formRef}
          action={formAction}
          className="flex max-h-[calc(88vh-88px)] flex-col"
        >
          <input type="hidden" name="id" value={tour.id} />
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
                  <Label htmlFor={`edit-season-${tour.id}`}>Saison</Label>
                  <Select value={seasonId} onValueChange={setSeasonId}>
                    <SelectTrigger id={`edit-season-${tour.id}`}>
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
                  <Label htmlFor={`edit-club-${tour.id}`}>Club organisateur</Label>
                  <Select value={clubId} onValueChange={setClubId}>
                    <SelectTrigger id={`edit-club-${tour.id}`}>
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
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-[1.5fr_0.9fr]">
                <div className="space-y-2">
                  <Label htmlFor={`edit-name-${tour.id}`}>Nom du tour</Label>
                  <Input
                    id={`edit-name-${tour.id}`}
                    name="name"
                    defaultValue={tour.name}
                    placeholder="Tour decouverte"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`edit-date-${tour.id}`}>Date</Label>
                  <Input
                    id={`edit-date-${tour.id}`}
                    name="date"
                    type="date"
                    defaultValue={toDateInputValue(tour.date)}
                  />
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
                  <Label htmlFor={`edit-cover-${tour.id}`}>Couverture (URL)</Label>
                  <Input
                    id={`edit-cover-${tour.id}`}
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
                          alt={`Couverture ${tour.name}`}
                          fill
                          sizes="(max-width: 1023px) 100vw, 380px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-[16/9] items-center justify-center rounded-[28px] border border-dashed border-border/70 bg-muted/40 px-4 text-center text-xs text-muted-foreground">
                        Ajoutez une URL de couverture pour previsualiser l&apos;image ici.
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
                    <Label htmlFor={`edit-rules-${tour.id}`}>Reglement (URL)</Label>
                    <Input
                      id={`edit-rules-${tour.id}`}
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
                      Liens actuels
                    </div>
                    <div className="mt-3 space-y-2 text-sm">
                      {coverUrl ? (
                        <Button asChild size="sm" variant="outline" className="w-full justify-between">
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
                        <Button asChild size="sm" variant="outline" className="w-full justify-between">
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
              Les changements mettent a jour la fiche publique et l&apos;admin.
            </p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <SubmitButton
                disabled={!hasSeason || !hasClubs || !seasonId || !clubId || !venueValue}
              />
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
