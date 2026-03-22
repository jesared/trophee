import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const registrations = [
  {
    id: "reg-1",
    tour: "Tour 3 - Riviera",
    tableau: "-1500",
    status: "validated",
  },
  {
    id: "reg-2",
    tour: "Tour 2 - Printemps",
    tableau: "-1300",
    status: "pending",
  },
  {
    id: "reg-3",
    tour: "Tour 1 - Ouverture",
    tableau: "+1500",
    status: "validated",
  },
];

const statusStyles: Record<string, string> = {
  validated:
    "bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:ring-emerald-400/40",
  pending:
    "bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-500/20 dark:text-amber-200 dark:ring-amber-400/40",
};

const statusLabels: Record<string, string> = {
  validated: "Valide",
  pending: "En attente",
};

export default function UserRegistrationsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Mes inscriptions
        </h1>
        <p className="text-sm text-muted-foreground">
          Suivez vos inscriptions aux tours et tableaux.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tour</TableHead>
              <TableHead>Tableau</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations.map((registration) => (
              <TableRow key={registration.id}>
                <TableCell className="font-medium">
                  {registration.tour}
                </TableCell>
                <TableCell>{registration.tableau}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                      statusStyles[registration.status]
                    }`}
                  >
                    {statusLabels[registration.status]}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm">
                    Annuler
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
