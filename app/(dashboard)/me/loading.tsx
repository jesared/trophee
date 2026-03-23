import { Skeleton } from "@/components/ui/skeleton";

export default function UserDashboardLoading() {
  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`card-${index}`}
            className="surface p-5"
          >
            <div className="space-y-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-16" />
              <Skeleton className="h-8" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
