export function DashboardSkeleton() {
  return <div role="status" aria-label="Loading dashboard" className="motion-safe:animate-pulse">
    <span className="sr-only">Loading dashboard…</span>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-hidden="true">
      {Array.from({length:4},(_,i)=><div key={i} className="surface p-6"><div className="h-5 w-5 rounded bg-slate-200"/><div className="mt-5 h-9 w-16 rounded bg-slate-200"/><div className="mt-2 h-4 w-32 rounded bg-slate-100"/></div>)}
    </div>
    <div className="surface mt-6 p-6" aria-hidden="true"><div className="h-5 w-40 rounded bg-slate-200"/><div className="mt-8 h-48 rounded bg-slate-100"/></div>
    <div className="mt-6 grid gap-6 xl:grid-cols-2" aria-hidden="true">{[0,1].map(i=><div key={i} className="surface h-64 p-6"><div className="h-5 w-40 rounded bg-slate-200"/><div className="mt-6 h-36 rounded bg-slate-100"/></div>)}</div>
  </div>;
}
