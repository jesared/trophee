"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type ActionState = {
  ok: boolean;
  message: string;
};

type AdminDeleteFormProps = {
  id: string;
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  label?: string;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button variant="destructive" size="sm" disabled={pending}>
      {pending ? "Suppression..." : label}
    </Button>
  );
}

export function AdminDeleteForm({
  id,
  action,
  label = "Supprimer",
}: AdminDeleteFormProps) {
  const [state, formAction] = React.useActionState(action, {
    ok: false,
    message: "",
  });

  React.useEffect(() => {
    if (!state.message) {
      return;
    }

    if (state.ok) {
      toast.success(state.message);
      return;
    }

    toast.error(state.message);
  }, [state.message, state.ok]);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <SubmitButton label={label} />
    </form>
  );
}
