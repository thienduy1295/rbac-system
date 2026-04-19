export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-6 w-20 rounded-md bg-muted animate-pulse" />
          <div className="h-4 w-52 rounded-md bg-muted animate-pulse" />
        </div>
        <div className="h-9 w-28 rounded-md bg-muted animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-10 rounded-md bg-muted animate-pulse" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 rounded-md bg-muted/60 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
