"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { notifyError, notifySuccess } from "@/lib/toast";
import { cn } from "@/lib/utils";

type AdminMediaUploadProps = {
  folders: { label: string; value: string }[];
  onUploaded?: () => void;
};

export function AdminMediaUpload({
  folders,
  onUploaded,
}: AdminMediaUploadProps) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);
  const [folder, setFolder] = React.useState(folders[0]?.value ?? "autres");
  const formRef = React.useRef<HTMLFormElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFiles = (nextFiles: File[]) => {
    const images = nextFiles.filter((file) => file.type.startsWith("image/"));
    if (images.length === 0) {
      notifyError("Aucune image valide.");
      return;
    }
    setFiles((prev) => [...prev, ...images]);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (files.length === 0) {
      notifyError("Ajoute au moins une image.");
      return;
    }
    setPending(true);
    try {
      let success = 0;
      for (const file of files) {
        const formData = new FormData();
        formData.set("folder", folder);
        formData.set("file", file);
        const res = await fetch("/api/admin/medias/upload", {
          method: "POST",
          body: formData,
        });
        const data = (await res.json()) as { ok: boolean; message: string };
        if (!res.ok || !data.ok) {
          notifyError(data.message || "Upload echoue.");
        } else {
          success += 1;
        }
      }
      if (success > 0) {
        notifySuccess(`${success} image(s) uploadee(s).`);
        setFiles([]);
        formRef.current?.reset();
        onUploaded?.();
        router.refresh();
      }
    } catch {
      notifyError("Erreur serveur pendant l'upload.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="media-folder" className="text-xs text-muted-foreground">
          Dossier
        </Label>
        <Select value={folder} onValueChange={setFolder}>
          <SelectTrigger id="media-folder" className="h-10 w-full">
            <SelectValue placeholder="Choisir un dossier" />
          </SelectTrigger>
          <SelectContent>
            {folders.map((folder) => (
              <SelectItem key={folder.value} value={folder.value}>
                {folder.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground transition",
          dragActive && "border-primary/60 bg-primary/10 text-primary",
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          handleFiles(Array.from(event.dataTransfer.files));
        }}
        onClick={() => inputRef.current?.click()}
      >
        <p className="font-medium text-foreground">
          Glisse tes images ici ou clique pour choisir
        </p>
        <p className="text-xs">JPG, PNG, WebP, GIF, SVG.</p>
        <Input
          ref={inputRef}
          type="file"
          name="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            if (!event.target.files) return;
            handleFiles(Array.from(event.target.files));
            event.target.value = "";
          }}
        />
      </div>
      {files.length > 0 ? (
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between gap-2">
            <span>{files.length} fichier(s) selectionne(s)</span>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="text-destructive hover:text-destructive"
              onClick={() => setFiles([])}
            >
              Vider
            </Button>
          </div>
          <div className="max-h-24 space-y-1 overflow-auto rounded-md border border-border/60 bg-background px-3 py-2">
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} className="truncate">
                {file.name}
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Upload en cours..." : "Uploader"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Les images sont ajoutees dans le dossier choisi.
        </p>
      </div>
    </form>
  );
}
