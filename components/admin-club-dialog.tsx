"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { notifyError, notifySuccess } from "@/lib/toast";

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

type ActionState = {
  ok: boolean;
  message: string;
};

type AdminClubDialogProps = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? "Enregistrement..." : "Creer"}
    </Button>
  );
}

export function AdminClubDialog({ action }: AdminClubDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction] = React.useActionState(action, {
    ok: false,
    message: "",
  });
  const [ffttLoading, setFfttLoading] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement | null>(null);

  React.useEffect(() => {
    if (!state.message) {
      return;
    }

    if (state.ok) {
      notifySuccess(state.message);
      formRef.current?.reset();
      setOpen(false);
      return;
    }

    notifyError(state.message);
  }, [state.message, state.ok]);

  const handleFfttLookup = async () => {
    const form = formRef.current;
    if (!form) return;
    const numberInput = form.querySelector<HTMLInputElement>("#ffttNumber");
    const clubNumber = numberInput?.value?.trim();
    if (!clubNumber) {
      notifyError("Renseignez un numero de club.");
      return;
    }
    setFfttLoading(true);
    try {
      const res = await fetch("/api/admin/clubs/fftt-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubNumber }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        message: string;
        payload?: {
          id?: string;
          number?: string;
          hallName?: string;
          hallAddress1?: string;
          hallAddress2?: string;
          hallAddress3?: string;
          hallZip?: string;
          hallCity?: string;
          website?: string;
          contactName?: string;
          contactFirstName?: string;
          contactEmail?: string;
          contactPhone?: string;
          latitude?: number;
          longitude?: number;
        };
      };
      if (!res.ok || !data.ok) {
        notifyError(data.message || "FFTT indisponible.");
        return;
      }
      const payload = data.payload ?? {};

      const setValue = (id: string, value?: string | number) => {
        if (value === undefined || value === null || value === "") return;
        const input = form.querySelector<HTMLInputElement>(`#${id}`);
        if (input) input.value = String(value);
      };

      setValue("ffttNumber", payload.number);
      setValue("ffttId", payload.id);
      setValue("hallName", payload.hallName);
      setValue("hallAddress1", payload.hallAddress1);
      setValue("hallAddress2", payload.hallAddress2);
      setValue("hallAddress3", payload.hallAddress3);
      setValue("hallZip", payload.hallZip);
      setValue("hallCity", payload.hallCity);
      setValue("website", payload.website);
      setValue("contactName", payload.contactName);
      setValue("contactFirstName", payload.contactFirstName);
      setValue("contactEmail", payload.contactEmail);
      setValue("contactPhone", payload.contactPhone);
      setValue("latitude", payload.latitude);
      setValue("longitude", payload.longitude);

      notifySuccess("Informations FFTT chargees.");
    } catch {
      notifyError("Erreur FFTT.");
    } finally {
      setFfttLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Creer un club</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouveau club</DialogTitle>
          <DialogDescription>
            Ajoutez un club organisateur pour les tours.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="space-y-4">
          <input type="hidden" id="ffttId" name="ffttId" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input id="name" name="name" placeholder="USC Reims" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input id="city" name="city" placeholder="Reims" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <Label htmlFor="ffttNumber">Numero FFTT</Label>
              <Input id="ffttNumber" name="ffttNumber" placeholder="XXXX" />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="secondary"
                onClick={handleFfttLookup}
                disabled={ffttLoading}
              >
                {ffttLoading ? "Recherche..." : "Auto-remplir FFTT"}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hallName">Salle</Label>
              <Input id="hallName" name="hallName" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hallCity">Ville salle</Label>
              <Input id="hallCity" name="hallCity" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hallAddress1">Adresse salle</Label>
            <Input id="hallAddress1" name="hallAddress1" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hallAddress2">Adresse (suite)</Label>
              <Input id="hallAddress2" name="hallAddress2" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hallAddress3">Adresse (suite)</Label>
              <Input id="hallAddress3" name="hallAddress3" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hallZip">Code postal salle</Label>
              <Input id="hallZip" name="hallZip" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Site web</Label>
              <Input id="website" name="website" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactName">Nom correspondant</Label>
              <Input id="contactName" name="contactName" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactFirstName">Prenom correspondant</Label>
              <Input id="contactFirstName" name="contactFirstName" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email correspondant</Label>
              <Input id="contactEmail" name="contactEmail" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Telephone correspondant</Label>
              <Input id="contactPhone" name="contactPhone" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input id="latitude" name="latitude" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input id="longitude" name="longitude" />
            </div>
          </div>

          <div className="flex justify-end">
            <SubmitButton disabled={false} />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
