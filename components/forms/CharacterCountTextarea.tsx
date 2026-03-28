"use client";

import * as React from "react";

type CharacterCountTextareaProps = {
  id: string;
  name: string;
  maxLength: number;
  placeholder?: string;
  defaultValue?: string;
};

export function CharacterCountTextarea({
  id,
  name,
  maxLength,
  placeholder,
  defaultValue = "",
}: CharacterCountTextareaProps) {
  const [value, setValue] = React.useState(defaultValue);
  const remaining = Math.max(maxLength - value.length, 0);

  return (
    <div>
      <textarea
        id={id}
        name={name}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{maxLength} caractères maximum.</span>
        <span>{remaining} restants</span>
      </div>
    </div>
  );
}
