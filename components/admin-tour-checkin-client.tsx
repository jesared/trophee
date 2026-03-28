"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type PresenceValue = "UNKNOWN" | "PRESENT" | "ABSENT";

export type CheckinTableau = {
  id: string;
  name: string;
  presence: PresenceValue;
  registrationId: string;
};

export type CheckinRow = {
  playerId: string;
  playerName: string;
  tableaux: CheckinTableau[];
};

type CheckinClientProps = {
  rows: CheckinRow[];
  tourId: string;
  action: (formData: FormData) => Promise<void>;
};

function PresencePill({ value }: { value: PresenceValue }) {
  const label =
    value === "PRESENT" ? "Présent" : value === "ABSENT" ? "Absent" : "À pointer";
  return <span className="badge-pill">{label}</span>;
}

export function AdminTourCheckinClient({
  rows,
  tourId,
  action,
}: CheckinClientProps) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get("q") ?? "";
  const [query, setQuery] = React.useState(initialQuery);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const filtered = rows.filter((row) =>
    row.playerName.toLowerCase().includes(query.toLowerCase()),
  );

  const submitPresence = async (
    registrationId: string,
    presence: PresenceValue,
  ) => {
    const formData = new FormData();
    formData.set("ids", registrationId);
    formData.set("presence", presence);
    formData.set("tourId", tourId);
    setPendingId(registrationId);
    try {
      await action(formData);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 bg-background/80 pb-3 pt-2 backdrop-blur">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher un joueur"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucun joueur trouvé pour cette recherche.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((row) => (
            <Card key={row.playerId} className="surface">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{row.playerName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {row.tableaux.map((tableau) => (
                  <div
                    key={tableau.registrationId}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        Tableau {tableau.name}
                      </p>
                      <PresencePill value={tableau.presence} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        disabled={pendingId === tableau.registrationId}
                        onClick={() =>
                          submitPresence(tableau.registrationId, "PRESENT")
                        }
                      >
                        Présent
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={pendingId === tableau.registrationId}
                        onClick={() =>
                          submitPresence(tableau.registrationId, "ABSENT")
                        }
                      >
                        Absent
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={pendingId === tableau.registrationId}
                        onClick={() =>
                          submitPresence(tableau.registrationId, "UNKNOWN")
                        }
                      >
                        Réinitialiser
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
