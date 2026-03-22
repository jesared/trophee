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
      setOpen(false);
    }
  }, [state.ok]);

  const venueValue = place.place?.name ?? place.value;
  const cityValue = place.place?.city ?? "";
  const addressValue = place.place?.formatted_address ?? place.value;

  const hasSeason = seasons.length > 0;
  const hasClubs = clubs.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!hasSeason || !hasClubs}>Creer un tour</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Creer un tour</DialogTitle>
          <DialogDescription>
            Renseignez les informations du nouveau tour.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="season">Saison</Label>
            <Select value={seasonId} onValueChange={setSeasonId}>
              <SelectTrigger id="season">
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
            <Label htmlFor="club">Club organisateur</Label>
            <Select value={clubId} onValueChange={setClubId}>
              <SelectTrigger id="club">
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
                Creez un club pour activer la creation de tour.
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input id="name" name="name" placeholder="Tour decouverte" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" name="date" type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="venue">Salle</Label>
            <PlaceAutocomplete value={place} onChange={setPlace} />
            <input type="hidden" name="venue" value={venueValue} />
            <input type="hidden" name="city" value={cityValue} />
            <input type="hidden" name="address" value={addressValue} />
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
            <SubmitButton disabled={!venueValue || !seasonId || !clubId} />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
