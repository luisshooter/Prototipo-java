import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { mensagemDeErro } from "../api/client";

const LOG_AMBIENTE = [
  "#0231  Financeiro    Apple Inc.",
  "#0198  Vendas        Google",
  "#0304  Expedição     Tesla",
  "#0087  Foguetes      SpaceX",
  "#0255  Financeiro    Microsoft",
  "#0142  Vendas        SpaceX",
  "#0311  Expedição     Google",
  "#0069  Foguetes      Tesla",
];

export function LoginPage() {
  const { usuario, entrar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (usuario) {
    const destino = (location.state as { de?: string } | null)?.de ?? "/dashboard";
    return <Navigate to={destino} replace />;
  }

  async function aoSubmeter(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);

    if (!email.trim() || !senha) {
      setErro("Informe e-mail e senha.");
      return;
    }

    setEnviando(true);
    try {
      await entrar(email.trim(), senha);
      navigate("/dashboard", { replace: true });
    } catch (erroRequisicao) {
      setErro(mensagemDeErro(erroRequisicao, "E-mail ou senha inválidos."));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink-950 px-12 py-14 text-slate-300 lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-500/15 text-brand-400">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path d="M4 16l4-8 3 5.5L14 8l3 6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-display text-sm font-semibold text-white">ALFA Suporte</span>
          </div>

          <h1 className="mt-16 max-w-sm font-display text-3xl font-semibold leading-tight text-white">
            Chamados, clientes e módulos em um só painel.
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            Acompanhe o volume de chamados por cliente e por módulo, abra novos
            registros e pesquise receitas — tudo atrás de uma sessão autenticada.
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="mb-3 text-[11px] uppercase tracking-wider text-slate-500">Fluxo recente · somente leitura</p>
          <div className="space-y-1.5 font-mono text-[12px] text-slate-500">
            {LOG_AMBIENTE.map((linha) => (
              <p key={linha}>{linha}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <span className="font-display text-lg font-semibold text-slate-900">ALFA Suporte</span>
          </div>

          <h2 className="font-display text-2xl font-semibold text-slate-900">Entrar</h2>
          <p className="mt-1.5 text-sm text-slate-500">Use suas credenciais para acessar o console.</p>

          <form onSubmit={aoSubmeter} className="mt-7 space-y-4" noValidate>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@alfa.com"
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="senha">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {erro && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{erro}</p>}

            <button
              type="submit"
              disabled={enviando}
              className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
            >
              {enviando ? "Entrando…" : "Entrar"}
            </button>
          </form>

          <p className="mt-6 text-xs text-slate-400">
            Credenciais de avaliação: <span className="font-mono">admin@alfa.com</span> /{" "}
            <span className="font-mono">user@alfa.com</span> — detalhes no README.
          </p>
        </div>
      </div>
    </div>
  );
}
