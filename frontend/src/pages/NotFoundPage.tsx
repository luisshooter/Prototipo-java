import { useMemo, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from "react";
import { Link } from "react-router-dom";

const FRAGMENTOS = [
  { texto: "#0231", top: "18%", left: "12%", profundidade: 22, atraso: "0s" },
  { texto: "#0198", top: "70%", left: "16%", profundidade: 34, atraso: "0.2s" },
  { texto: "Financeiro", top: "22%", left: "82%", profundidade: 28, atraso: "0.4s" },
  { texto: "#0399", top: "76%", left: "80%", profundidade: 40, atraso: "0.1s" },
  { texto: "Expedição", top: "50%", left: "6%", profundidade: 50, atraso: "0.3s" },
  { texto: "#0069", top: "12%", left: "50%", profundidade: 30, atraso: "0.5s" },
];

const REDUZ_MOVIMENTO =
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function NotFoundPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [posicao, setPosicao] = useState({ x: 0, y: 0 });

  const estiloCartao = useMemo(() => {
    if (REDUZ_MOVIMENTO) return undefined;
    return {
      transform: `rotateY(${posicao.x * 12}deg) rotateX(${posicao.y * -12}deg)`,
    };
  }, [posicao]);

  function aoMoverMouse(evento: ReactMouseEvent<HTMLDivElement>) {
    if (REDUZ_MOVIMENTO) return;
    const retangulo = containerRef.current?.getBoundingClientRect();
    if (!retangulo) return;
    const x = (evento.clientX - retangulo.left) / retangulo.width - 0.5;
    const y = (evento.clientY - retangulo.top) / retangulo.height - 0.5;
    setPosicao({ x, y });
  }

  function aoSairMouse() {
    setPosicao({ x: 0, y: 0 });
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={aoMoverMouse}
      onMouseLeave={aoSairMouse}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-950 px-6"
      style={{ perspective: "1200px" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30 transition-transform duration-200"
        style={{
          background: "radial-gradient(600px circle at 50% 40%, rgba(45,212,196,0.16), transparent 70%)",
          transform: REDUZ_MOVIMENTO ? undefined : `translate(${posicao.x * 20}px, ${posicao.y * 20}px)`,
        }}
      />

      {FRAGMENTOS.map((fragmento) => (
        <span
          key={fragmento.texto}
          aria-hidden
          className="pointer-events-none absolute hidden select-none rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-slate-500 animate-float-slow sm:block"
          style={
            {
              top: fragmento.top,
              left: fragmento.left,
              animationDelay: fragmento.atraso,
              "--dur": `${6 + fragmento.profundidade / 10}s`,
              transform: REDUZ_MOVIMENTO
                ? undefined
                : `translate(${posicao.x * fragmento.profundidade}px, ${posicao.y * fragmento.profundidade}px)`,
              transition: "transform 120ms ease-out",
            } as CSSProperties
          }
        >
          {fragmento.texto}
        </span>
      ))}

      <div className="relative" style={{ transformStyle: "preserve-3d" }}>
        <div
          className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl backdrop-blur-sm transition-transform duration-150 ease-out"
          style={estiloCartao}
        >
          <p className="font-mono text-xs uppercase tracking-widest text-brand-400">Chamado #404</p>
          <p className="mt-3 font-display text-6xl font-semibold text-white">404</p>
          <h1 className="mt-4 font-display text-lg font-semibold text-white">Página não encontrada</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Esse chamado não existe, foi movido ou você digitou o endereço errado.
          </p>

          <Link
            to="/dashboard"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path d="M11 19l-7-7 7-7M4 12h16" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Voltar ao dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
