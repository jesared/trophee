import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function UserRegistrationsPage() {
  return (
    <section className="page">
      <div className="page-header">
        <h1 className="page-title">Mes inscriptions</h1>
        <p className="page-subtitle">
          Suivez vos inscriptions aux tours et tableaux.
        </p>
      </div>

      <div className="surface">
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
            <TableRow>
              <TableCell colSpan={4} className="py-6">
                <EmptyState
                  title="Aucune inscription pour le moment"
                  description="Inscrivez-vous à un tour pour apparaître ici."
                  action={
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button asChild size="sm">
                        <Link href="/inscription">S'inscrire</Link>
                      </Button>
                      <Button asChild size="sm" variant="secondary">
                        <Link href="/agenda">Voir les tours</Link>
                      </Button>
                    </div>
                  }
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
