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

type AdminPlayerDialogProps = {
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

export function AdminPlayerDialog({ action }: AdminPlayerDialogProps) {
  const [open, setOpen] = React.useState(false);
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
      setOpen(false);
      return;
    }

    notifyError(state.message);
  }, [state.message, state.ok]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Creer un joueur</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouveau joueur</DialogTitle>
          <DialogDescription>
            Renseignez les informations principales du joueur.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prenom</Label>
              <Input id="firstName" name="firstName" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input id="lastName" name="lastName" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="club">Club</Label>
              <Input id="club" name="club" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="points">Points</Label>
              <Input id="points" name="points" type="number" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="licence">Licence</Label>
            <Input id="licence" name="licence" />
          </div>
          <div className="flex justify-end">
            <SubmitButton disabled={false} />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
