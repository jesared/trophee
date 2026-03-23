export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-6 w-40 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-64 animate-pulse rounded-md bg-muted" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="surface p-4">
          <div className="space-y-3">
            <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
            <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
            <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
            <div className="h-9 w-40 animate-pulse rounded-md bg-muted" />
          </div>
        </div>

        <div className="surface">
          <div className="space-y-3 p-4">
            <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
