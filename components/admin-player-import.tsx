"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ActionState = {
  ok: boolean;
  message: string;
};

type AdminPlayerImportProps = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? "Import..." : "Importer CSV"}
    </Button>
  );
}

export function AdminPlayerImport({ action }: AdminPlayerImportProps) {
  const [file, setFile] = React.useState<File | null>(null);
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
      toast.success(state.message);
      formRef.current?.reset();
      setFile(null);
      return;
    }

    toast.error(state.message);
  }, [state.message, state.ok]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          type="file"
          name="file"
          accept=".csv,text/csv"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
        <SubmitButton disabled={!file} />
      </div>
      <p className="text-xs text-muted-foreground">
        Colonnes attendues: firstName, lastName, email, club, points, licence.
      </p>
    </form>
  );
}
