import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-center">
      <p className="font-mono text-sm text-slate-400">404</p>
      <h1 className="font-display text-xl font-semibold text-slate-800">Página não encontrada</h1>
      <Link to="/dashboard" className="text-sm font-medium text-brand-600 hover:text-brand-700">
        Voltar ao dashboard
      </Link>
    </div>
  );
}
