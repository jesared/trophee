"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";

import { notifyError, notifySuccess } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ActionState = {
  ok: boolean;
  message: string;
};

type AdminHorairesFormProps = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaultTitle: string;
  defaultContent: string;
  updatedAtLabel?: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Enregistrement..." : "Enregistrer"}
    </Button>
  );
}

export function AdminHorairesForm({
  action,
  defaultTitle,
  defaultContent,
  updatedAtLabel,
}: AdminHorairesFormProps) {
  const [state, formAction] = React.useActionState(action, {
    ok: false,
    message: "",
  });

  React.useEffect(() => {
    if (!state.message) return;
    if (state.ok) {
      notifySuccess(state.message);
      return;
    }
    notifyError(state.message);
  }, [state.message, state.ok]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Titre</Label>
        <Input id="title" name="title" defaultValue={defaultTitle} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Contenu</Label>
        <Textarea
          id="content"
          name="content"
          defaultValue={defaultContent}
          rows={10}
        />
      </div>
      {updatedAtLabel ? (
        <p className="text-xs text-muted-foreground">
          Derniere mise a jour : {updatedAtLabel}
        </p>
      ) : null}
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
