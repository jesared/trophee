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
          hallAddress?: string;
          hallZip?: string;
          hallCity?: string;
          contactName?: string;
          contactFirstName?: string;
          contactEmail?: string;
          contactPhone?: string;
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
      setValue("hallAddress", payload.hallAddress);
      setValue("hallZip", payload.hallZip);
      setValue("hallCity", payload.hallCity);
      setValue("contactName", payload.contactName);
      setValue("contactFirstName", payload.contactFirstName);
      setValue("contactEmail", payload.contactEmail);
      setValue("contactPhone", payload.contactPhone);

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
            <Label htmlFor="hallAddress">Adresse salle</Label>
            <Input id="hallAddress" name="hallAddress" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hallZip">Code postal salle</Label>
              <Input id="hallZip" name="hallZip" />
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

          <div className="flex justify-end">
            <SubmitButton disabled={false} />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
