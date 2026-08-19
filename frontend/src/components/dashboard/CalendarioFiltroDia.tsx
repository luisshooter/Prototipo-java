import { useEffect, useRef, useState } from "react";
import { NOMES_MESES } from "../../utils/date";

interface CalendarioFiltroDiaProps {
  mes: number;
  ano: number;
  diasComChamados: Set<string>;
  valor: string | null;
  aoSelecionar: (diaIso: string | null) => void;
}

const DIAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];

function paraIso(ano: number, mes: number, dia: number): string {
  return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

export function CalendarioFiltroDia({ mes, ano, diasComChamados, valor, aoSelecionar }: CalendarioFiltroDiaProps) {
  const [aberto, setAberto] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function aoClicarFora(evento: MouseEvent) {
      if (raiz.current && !raiz.current.contains(evento.target as Node)) {
        setAberto(false);
      }
    }
    function aoPressionarTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") setAberto(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoPressionarTecla);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoPressionarTecla);
    };
  }, []);

  const primeiroDiaSemana = new Date(ano, mes - 1, 1).getDay();
  const totalDias = new Date(ano, mes, 0).getDate();
  const celulas: (number | null)[] = [
    ...Array.from({ length: primeiroDiaSemana }, () => null),
    ...Array.from({ length: totalDias }, (_, i) => i + 1),
  ];

  const hoje = new Date();
  const ehHoje = (dia: number) =>
    hoje.getFullYear() === ano && hoje.getMonth() + 1 === mes && hoje.getDate() === dia;

  function selecionarDia(dia: number) {
    const iso = paraIso(ano, mes, dia);
    aoSelecionar(valor === iso ? null : iso);
    setAberto(false);
  }

  return (
    <div className="relative" ref={raiz}>
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        className={`flex items-center gap-2 rounded-lg border px-3.5 py-1.5 text-sm font-medium shadow-sm transition ${
          valor
            ? "border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100"
            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
          <rect x="3.5" y="5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth={1.7} />
          <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" />
        </svg>
        {valor ? valor.split("-").reverse().slice(0, 2).join("/") : "Filtrar dia"}
        {valor && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              aoSelecionar(null);
            }}
            className="ml-0.5 rounded-full p-0.5 text-brand-500 transition hover:bg-brand-200/60 hover:text-brand-800"
            aria-label="Limpar filtro de dia"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
            </svg>
          </span>
        )}
      </button>

      {aberto && (
        <div className="animate-popover-in absolute right-0 z-40 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {NOMES_MESES[mes - 1]} {ano}
          </p>

          <div className="grid grid-cols-7 gap-y-1 text-center text-[11px] font-medium text-slate-400">
            {DIAS_SEMANA.map((d, i) => (
              <span key={`${d}-${i}`}>{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1">
            {celulas.map((dia, indice) => {
              if (dia === null) return <div key={`vazio-${indice}`} />;
              const iso = paraIso(ano, mes, dia);
              const selecionado = valor === iso;
              const temChamado = diasComChamados.has(iso);
              return (
                <div key={iso} className="flex items-center justify-center py-0.5">
                  <button
                    type="button"
                    onClick={() => selecionarDia(dia)}
                    style={{ "--stagger": `${indice * 6}ms` } as React.CSSProperties}
                    className={`animate-day-in relative flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition hover:scale-110 active:scale-95 ${
                      selecionado
                        ? "bg-brand-600 text-white shadow-sm"
                        : ehHoje(dia)
                          ? "text-brand-700 ring-1 ring-inset ring-brand-300 hover:bg-brand-50"
                          : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {dia}
                    {temChamado && !selecionado && (
                      <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-brand-500" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {valor && (
            <button
              type="button"
              onClick={() => {
                aoSelecionar(null);
                setAberto(false);
              }}
              className="mt-2 w-full rounded-lg px-2 py-1.5 text-center text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              Limpar filtro
            </button>
          )}
        </div>
      )}
    </div>
  );
}
