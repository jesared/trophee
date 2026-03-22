import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const profile = {
  name: "Thomas Dupont",
  email: "thomas.dupont@example.com",
  club: "TT Paris Centre",
  points: 1480,
};

export default function UserProfilePage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mon profil</h1>
        <p className="text-sm text-muted-foreground">
          Mettez a jour vos informations personnelles.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-background p-6">
        <form className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input id="name" defaultValue={profile.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={profile.email} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="club">Club</Label>
              <Input id="club" defaultValue={profile.club} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="points">Points</Label>
              <Input id="points" type="number" defaultValue={profile.points} />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="button">Enregistrer</Button>
          </div>
        </form>
      </div>
    </section>
  );
}
