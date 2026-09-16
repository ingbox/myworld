"use client";

export default function Sidebar() {
  const sections = [
    {
      id: "get",
      label: "GET /cats/images",
      badge: "GET",
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      id: "canvas",
      label: "POST /cats/drawings",
      badge: "POST",
      badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      id: "drawings",
      label: "GET /cats/drawings",
      badge: "GET",
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      id: "sounds",
      label: "WS /cats/sounds",
      badge: "WS",
      badgeColor: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    },
  ];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950">
      <div className="border-b border-slate-800 px-5 py-5">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐱</span>
          <div>
            <div className="text-sm leading-tight font-semibold text-slate-100">CatAPI</div>
            <div className="font-mono text-xs text-slate-500">prisma practice</div>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-800 px-5 py-3">
        <span className="font-mono text-xs text-slate-500">v1.0.0</span>
        <span className="mx-2 text-slate-700">·</span>
        <span className="font-mono text-xs text-violet-400">REST + WebSocket</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-3 px-2 font-mono text-xs tracking-wider text-slate-600 uppercase">
          Endpoints
        </div>
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            className="group mb-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-slate-800/60"
          >
            <span
              className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold shrink-0 ${s.badgeColor}`}
            >
              {s.badge}
            </span>
            <span className="truncate font-mono text-xs text-slate-400 transition-colors group-hover:text-slate-200">
              {s.label.replace(/^[A-Z]+ /, "")}
            </span>
          </button>
        ))}
      </nav>

      <div className="border-t border-slate-800 px-5 py-4">
        <div className="font-mono text-xs text-slate-600">powered by Jiseop Lim</div>
      </div>
    </aside>
  );
}
