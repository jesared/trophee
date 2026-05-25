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

type AdminTableauTemplateDialogProps = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  seasons: SeasonOption[];
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? "Enregistrement..." : "Ajouter"}
    </Button>
  );
}

export function AdminTableauTemplateDialog({
  action,
  seasons,
}: AdminTableauTemplateDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [seasonId, setSeasonId] = React.useState("");
  const [state, formAction] = React.useActionState(action, {
    ok: false,
    message: "",
  });
  const formRef = React.useRef<HTMLFormElement | null>(null);

  React.useEffect(() => {
    if (!state.message) {
      return;
    }

    if (state.ok) {
      notifySuccess(state.message);
      formRef.current?.reset();
      setSeasonId("");
      setOpen(false);
      return;
    }

    notifyError(state.message);
  }, [state.message, state.ok]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={seasons.length === 0}>Ajouter un tableau</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouveau tableau de reference</DialogTitle>
          <DialogDescription>
            Definissez la saison, la plage de points et l&apos;horaire de
            ce tableau de reference.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seasonId">Saison</Label>
            <Select value={seasonId} onValueChange={setSeasonId}>
              <SelectTrigger id="seasonId">
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
            <Label htmlFor="name">Nom</Label>
            <Input id="name" name="name" placeholder="-1300" minLength={1} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="minPoints">Points min</Label>
              <Input id="minPoints" name="minPoints" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxPoints">Points max</Label>
              <Input id="maxPoints" name="maxPoints" type="number" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="startTime">Horaire</Label>
            <Input id="startTime" name="startTime" type="time" required />
          </div>
          <div className="flex justify-end">
            <SubmitButton disabled={!seasonId} />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
