export default function Loading() {
  return (
    <div className="space-y-4 pt-8">
      <div className="h-8 w-48 animate-pulse rounded bg-white/10" />
      <div className="h-40 animate-pulse rounded-3xl bg-white/5" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/5" />
        ))}
      </div>
    </div>
  );
}
