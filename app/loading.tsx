export default function Loading() {
  return (
    <div className="space-y-6 animate-pageIn">
      <div className="space-y-3">
        <div className="h-4 w-40 rounded bg-zinc-800/60 skeleton" />
        <div className="h-10 w-72 rounded bg-zinc-800/60 skeleton" />
        <div className="h-4 w-[520px] max-w-full rounded bg-zinc-800/60 skeleton" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-5">
            <div className="h-3 w-20 rounded bg-zinc-800/60 skeleton" />
            <div className="h-7 w-24 rounded bg-zinc-800/60 skeleton mt-4" />
            <div className="h-3 w-28 rounded bg-zinc-800/60 skeleton mt-3" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6 min-h-[260px]">
          <div className="h-5 w-40 rounded bg-zinc-800/60 skeleton" />
          <div className="h-4 w-[420px] max-w-full rounded bg-zinc-800/60 skeleton mt-4" />
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-zinc-800 p-4">
                <div className="h-3 w-16 rounded bg-zinc-800/60 skeleton" />
                <div className="h-4 w-24 rounded bg-zinc-800/60 skeleton mt-3" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6">
          <div className="h-5 w-32 rounded bg-zinc-800/60 skeleton" />
          <div className="h-4 w-44 rounded bg-zinc-800/60 skeleton mt-4" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-11 rounded-xl border border-zinc-800 bg-zinc-900/20 skeleton" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
