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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formatRange = (minPoints?: number | null, maxPoints?: number | null) => {
  if (minPoints != null && maxPoints != null) {
    return `${minPoints} - ${maxPoints}`;
  }
  if (minPoints != null) {
    return `>= ${minPoints}`;
  }
  if (maxPoints != null) {
    return `<= ${maxPoints}`;
  }
  return "Libre";
};

const ALL_TEMPLATES_VALUE = "__all_templates__";

type ActionState = {
  ok: boolean;
  message: string;
};

type TourOption = {
  id: string;
  label: string;
  seasonId: string;
};

type TemplateOption = {
  id: string;
  name: string;
  minPoints?: number | null;
  maxPoints?: number | null;
  startTime?: string | null;
  seasonId?: string | null;
};

type AdminTableauDialogProps = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  tours: TourOption[];
  templates: TemplateOption[];
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? "Enregistrement..." : "Creer"}
    </Button>
  );
}

export function AdminTableauDialog({
  action,
  tours,
  templates,
}: AdminTableauDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [tourId, setTourId] = React.useState("");
  const [templateId, setTemplateId] = React.useState("");
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
      setTourId("");
      setTemplateId("");
      setOpen(false);
      return;
    }

    notifyError(state.message);
  }, [state.message, state.ok]);

  const selectedTour = tours.find((tour) => tour.id === tourId);
  const filteredTemplates = selectedTour
    ? templates.filter((template) => template.seasonId === selectedTour.seasonId)
    : [];
  const disabled = tours.length === 0 || templates.length === 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled}>Ajouter des tableaux</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajouter des tableaux</DialogTitle>
          <DialogDescription>
            Ajoutez un template precis ou tous les templates manquants pour un
            tour, selon sa saison.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tour">Tour</Label>
            <Select
              value={tourId}
              onValueChange={(value) => {
                setTourId(value);
                setTemplateId("");
              }}
            >
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
            <Label htmlFor="template">Template</Label>
            <Select
              value={templateId}
              onValueChange={setTemplateId}
              disabled={!tourId || filteredTemplates.length === 0}
            >
              <SelectTrigger id="template">
                <SelectValue
                  placeholder={
                    !tourId
                      ? "Choisir un tour d'abord"
                      : filteredTemplates.length === 0
                        ? "Aucun template pour cette saison"
                        : "Choisir un template"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_TEMPLATES_VALUE}>
                  Tous les templates manquants
                </SelectItem>
                {filteredTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} (
                    {formatRange(template.minPoints, template.maxPoints)})
                    {template.startTime ? ` - ${template.startTime}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="templateId" value={templateId} />
          </div>

          <div className="flex justify-end">
            <SubmitButton disabled={!templateId || !tourId} />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
