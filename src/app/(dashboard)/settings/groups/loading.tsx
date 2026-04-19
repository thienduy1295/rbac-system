export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-6 w-24 rounded-md bg-muted animate-pulse" />
          <div className="h-4 w-56 rounded-md bg-muted animate-pulse" />
        </div>
        <div className="h-9 w-32 rounded-md bg-muted animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-10 rounded-md bg-muted animate-pulse" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 rounded-md bg-muted/60 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
