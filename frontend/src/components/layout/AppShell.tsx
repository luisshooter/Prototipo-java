import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

const LINKS = [
  { to: "/dashboard", label: "Dashboard", icone: "M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6V11h-6v9Zm0-16v5h6V4h-6Z" },
  { to: "/receitas", label: "Receitas", icone: "M4 12h16M4 12a8 8 0 1 1 16 0M4 12a8 8 0 0 0 16 0" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { usuario, sair } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-60 shrink-0 flex-col bg-ink-950 text-slate-300">
        <div className="flex items-center gap-2.5 px-6 py-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-500/15 text-brand-400">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path
                d="M4 16l4-8 3 5.5L14 8l3 6"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <p className="font-display text-sm font-semibold leading-none text-white">ALFA Suporte</p>
            <p className="mt-1 text-[11px] uppercase tracking-wider text-slate-500">Console interno</p>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 px-3">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`
              }
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path d={link.icone} stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 px-4 py-4">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-slate-100">
              {usuario?.nome?.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-100">{usuario?.nome}</p>
              <p className="truncate text-xs text-slate-500">{usuario?.perfis.join(", ")}</p>
            </div>
          </div>
          <button
            onClick={sair}
            className="w-full rounded-lg border border-white/10 py-1.5 text-xs font-medium text-slate-400 transition hover:border-white/20 hover:text-white"
          >
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
