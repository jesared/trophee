"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";

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
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: AdminTourEditDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [state, formAction] = React.useActionState(action, {
    ok: false,
    message: "",
  });
  const [seasonId, setSeasonId] = React.useState(tour.seasonId);
  const [clubId, setClubId] = React.useState(tour.clubId ?? "");
  const [place, setPlace] = React.useState<PlaceValue>(() => buildInitialPlace(tour));
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
    if (!open) {
      setSeasonId(tour.seasonId);
      setClubId(tour.clubId ?? "");
      setPlace(buildInitialPlace(tour));
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier le tour</DialogTitle>
          <DialogDescription>
            Mettez a jour la date, le club, la salle et les liens associes.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={tour.id} />
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

          <div className="space-y-2">
            <Label htmlFor={`edit-name-${tour.id}`}>Nom</Label>
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

          <div className="space-y-2">
            <Label>Salle</Label>
            <PlaceAutocomplete value={place} onChange={setPlace} />
            <input type="hidden" name="venue" value={venueValue} />
            <input type="hidden" name="city" value={cityValue} />
            <input type="hidden" name="address" value={addressValue} />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`edit-cover-${tour.id}`}>Couverture (URL)</Label>
            <Input
              id={`edit-cover-${tour.id}`}
              name="coverUrl"
              type="url"
              placeholder="https://..."
              defaultValue={tour.coverUrl ?? ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`edit-rules-${tour.id}`}>Reglement (URL)</Label>
            <Input
              id={`edit-rules-${tour.id}`}
              name="rulesUrl"
              type="url"
              placeholder="https://..."
              defaultValue={tour.rulesUrl ?? ""}
            />
          </div>

          {state.message ? (
            <p
              className={
                state.ok
                  ? "text-sm text-emerald-600"
                  : "text-sm text-destructive"
              }
            >
              {state.message}
            </p>
          ) : null}

          <div className="flex justify-end">
            <SubmitButton disabled={!hasSeason || !hasClubs || !seasonId || !clubId || !venueValue} />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
