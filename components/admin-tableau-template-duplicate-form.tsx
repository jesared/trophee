"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { notifyError, notifySuccess } from "@/lib/toast";

type ActionState = {
  ok: boolean;
  message: string;
};

type SourceSeasonOption = {
  id: string;
  name: string;
  year: number;
  templateCount: number;
};

type AdminTableauTemplateDuplicateFormProps = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  targetSeasonId: string;
  sourceSeasons: SourceSeasonOption[];
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="sm" disabled={disabled || pending}>
      {pending ? "Duplication..." : "Dupliquer depuis cette saison"}
    </Button>
  );
}

export function AdminTableauTemplateDuplicateForm({
  action,
  targetSeasonId,
  sourceSeasons,
}: AdminTableauTemplateDuplicateFormProps) {
  const [sourceSeasonId, setSourceSeasonId] = React.useState(
    sourceSeasons[0]?.id ?? "",
  );
  const [state, formAction] = React.useActionState(action, {
    ok: false,
    message: "",
  });

  React.useEffect(() => {
    if (!state.message) {
      return;
    }

    if (state.ok) {
      notifySuccess(state.message);
      return;
    }

    notifyError(state.message);
  }, [state.message, state.ok]);

  if (sourceSeasons.length === 0) {
    return null;
  }

  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row">
      <input type="hidden" name="targetSeasonId" value={targetSeasonId} />
      <input type="hidden" name="sourceSeasonId" value={sourceSeasonId} />
      <Select value={sourceSeasonId} onValueChange={setSourceSeasonId}>
        <SelectTrigger className="sm:w-64">
          <SelectValue placeholder="Choisir une saison source" />
        </SelectTrigger>
        <SelectContent>
          {sourceSeasons.map((season) => (
            <SelectItem key={season.id} value={season.id}>
              {season.name} ({season.year}) - {season.templateCount} tableaux
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <SubmitButton disabled={!sourceSeasonId} />
    </form>
  );
}
