"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PlayerOption = {
  id: string;
  label: string;
};

type TableauOption = {
  id: string;
  label: string;
  tourId: string;
};

type TourOption = {
  id: string;
  label: string;
};

type ActionState = {
  ok: boolean;
  message: string;
};

type AdminRegistrationFormProps = {
  players: PlayerOption[];
  tableaux: TableauOption[];
  tours: TourOption[];
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? "Enregistrement..." : "Creer une inscription"}
    </Button>
  );
}

export function AdminRegistrationForm({
  players,
  tableaux,
  tours,
  action,
}: AdminRegistrationFormProps) {
  const [playerId, setPlayerId] = React.useState("");
  const [tableauId, setTableauId] = React.useState("");
  const [tourId, setTourId] = React.useState("");
  const [state, formAction] = React.useActionState(action, {
    ok: false,
    message: "",
  });
  const formRef = React.useRef<HTMLFormElement | null>(null);

  React.useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setPlayerId("");
      setTableauId("");
      setTourId("");
    }
  }, [state.ok]);

  const filteredTableaux = tourId
    ? tableaux.filter((tableau) => tableau.tourId === tourId)
    : tableaux;

  const isTableauDisabled = !tourId || filteredTableaux.length === 0;

  React.useEffect(() => {
    if (!tourId) {
      return;
    }

    if (filteredTableaux.some((tableau) => tableau.id === tableauId)) {
      return;
    }

    setTableauId("");
  }, [tourId, tableauId, filteredTableaux]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tour">Tour</Label>
        <Select value={tourId} onValueChange={setTourId}>
          <SelectTrigger id="tour">
            <SelectValue placeholder="Choisir un tour" />
          </SelectTrigger>
          <SelectContent>
            {tours.map((tour) => (
              <SelectItem key={tour.id} value={tour.id}>
                {tour.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="tourId" value={tourId} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="player">Joueur</Label>
        <Select value={playerId} onValueChange={setPlayerId}>
          <SelectTrigger id="player">
            <SelectValue placeholder="Choisir un joueur" />
          </SelectTrigger>
          <SelectContent>
            {players.map((player) => (
              <SelectItem key={player.id} value={player.id}>
                {player.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="playerId" value={playerId} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tableau">Tableau</Label>
        <Select
          value={tableauId}
          onValueChange={setTableauId}
          disabled={isTableauDisabled}
        >
          <SelectTrigger id="tableau">
            <SelectValue
              placeholder={
                !tourId
                  ? "Choisir un tour d'abord"
                  : filteredTableaux.length === 0
                    ? "Aucun tableau disponible"
                    : "Choisir un tableau"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {filteredTableaux.map((tableau) => (
              <SelectItem key={tableau.id} value={tableau.id}>
                {tableau.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="tableauId" value={tableauId} />
        <p className="text-xs text-muted-foreground">
          {tourId
            ? `${filteredTableaux.length} tableau(x) disponible(s) pour ce tour.`
            : "Selectionnez un tour pour afficher les tableaux disponibles."}
        </p>
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
        <SubmitButton disabled={!playerId || !tableauId || !tourId} />
      </div>
    </form>
  );
}
