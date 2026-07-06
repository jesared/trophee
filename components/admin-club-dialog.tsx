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
  club?: {
    id: string;
    name: string;
    city: string | null;
    ffttId: string | null;
    ffttNumber: string | null;
    hallName: string | null;
    hallAddress1: string | null;
    hallZip: string | null;
    hallCity: string | null;
    contactName: string | null;
    contactFirstName: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
  };
  description?: string;
  submitLabel?: string;
  title?: string;
  triggerLabel?: string;
};

function SubmitButton({
  disabled,
  label,
}: {
  disabled: boolean;
  label: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? "Enregistrement..." : label}
    </Button>
  );
}

export function AdminClubDialog({
  action,
  club,
  description = "Ajoutez un club organisateur pour les tours.",
  submitLabel = "Creer",
  title = "Nouveau club",
  triggerLabel = "Creer un club",
}: AdminClubDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [state, formAction] = React.useActionState(action, {
    ok: false,
    message: "",
  });
  const [ffttLoading, setFfttLoading] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement | null>(null);
  const inputId = React.useId();

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
    const numberInput =
      form.querySelector<HTMLInputElement>('[name="ffttNumber"]');
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
        clubSearch?: {
          name?: string;
        } | null;
      };
      if (!res.ok || !data.ok) {
        notifyError(data.message || "FFTT indisponible.");
        return;
      }
      const payload = data.payload ?? {};
      const clubSearch = data.clubSearch ?? null;

      const setValue = (name: string, value?: string | number) => {
        if (value === undefined || value === null || value === "") return;
        const input = form.querySelector<HTMLInputElement>(`[name="${name}"]`);
        if (input) input.value = String(value);
      };

      setValue("ffttNumber", payload.number);
      setValue("ffttId", payload.id);
      if (clubSearch?.name) {
        setValue("name", clubSearch.name);
      }
      if (payload.hallCity) {
        setValue("city", payload.hallCity);
      }
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
        <Button variant={club ? "secondary" : "default"}>{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="space-y-4">
          {club ? <input type="hidden" name="id" value={club.id} /> : null}
          <input
            type="hidden"
            id={`ffttId-${inputId}`}
            name="ffttId"
            defaultValue={club?.ffttId ?? ""}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`name-${inputId}`}>Nom</Label>
              <Input
                id={`name-${inputId}`}
                name="name"
                placeholder="USC Reims"
                defaultValue={club?.name ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`city-${inputId}`}>Ville</Label>
              <Input
                id={`city-${inputId}`}
                name="city"
                placeholder="Reims"
                defaultValue={club?.city ?? ""}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <Label htmlFor={`ffttNumber-${inputId}`}>Numero FFTT</Label>
              <Input
                id={`ffttNumber-${inputId}`}
                name="ffttNumber"
                placeholder="XXXX"
                defaultValue={club?.ffttNumber ?? ""}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="secondary"
                onClick={handleFfttLookup}
                disabled={ffttLoading}
                className="w-full sm:w-auto"
              >
                {ffttLoading ? "Recherche..." : "Auto-remplir FFTT"}
              </Button>
            </div>
          </div>

          <details className="rounded-lg border border-border/60 p-3">
            <summary className="cursor-pointer text-sm font-medium text-foreground">
              Infos salle
            </summary>
            <div className="mt-3 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`hallName-${inputId}`}>Salle</Label>
                  <Input
                    id={`hallName-${inputId}`}
                    name="hallName"
                    defaultValue={club?.hallName ?? ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`hallCity-${inputId}`}>Ville salle</Label>
                  <Input
                    id={`hallCity-${inputId}`}
                    name="hallCity"
                    defaultValue={club?.hallCity ?? ""}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`hallAddress-${inputId}`}>Adresse salle</Label>
                <Input
                  id={`hallAddress-${inputId}`}
                  name="hallAddress"
                  defaultValue={club?.hallAddress1 ?? ""}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`hallZip-${inputId}`}>Code postal salle</Label>
                  <Input
                    id={`hallZip-${inputId}`}
                    name="hallZip"
                    defaultValue={club?.hallZip ?? ""}
                  />
                </div>
              </div>
            </div>
          </details>

          <details className="rounded-lg border border-border/60 p-3">
            <summary className="cursor-pointer text-sm font-medium text-foreground">
              Contact
            </summary>
            <div className="mt-3 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`contactName-${inputId}`}>
                    Nom correspondant
                  </Label>
                  <Input
                    id={`contactName-${inputId}`}
                    name="contactName"
                    defaultValue={club?.contactName ?? ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`contactFirstName-${inputId}`}>
                    Prenom correspondant
                  </Label>
                  <Input
                    id={`contactFirstName-${inputId}`}
                    name="contactFirstName"
                    defaultValue={club?.contactFirstName ?? ""}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`contactEmail-${inputId}`}>
                    Email correspondant
                  </Label>
                  <Input
                    id={`contactEmail-${inputId}`}
                    name="contactEmail"
                    defaultValue={club?.contactEmail ?? ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`contactPhone-${inputId}`}>
                    Telephone correspondant
                  </Label>
                  <Input
                    id={`contactPhone-${inputId}`}
                    name="contactPhone"
                    defaultValue={club?.contactPhone ?? ""}
                  />
                </div>
              </div>
            </div>
          </details>

          <div className="flex justify-end">
            <SubmitButton disabled={false} label={submitLabel} />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
