import { NOMES_MESES } from "../../utils/date";

interface PeriodoSelectorProps {
  mes: number;
  ano: number;
  aoMudarMes: (mes: number) => void;
  aoMudarAno: (ano: number) => void;
}

const ANO_ATUAL = new Date().getFullYear();
const ANOS = Array.from({ length: 8 }, (_, i) => ANO_ATUAL - 5 + i);

export function PeriodoSelector({ mes, ano, aoMudarMes, aoMudarAno }: PeriodoSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="sr-only" htmlFor="seletor-mes">
        Mês
      </label>
      <select
        id="seletor-mes"
        value={mes}
        onChange={(e) => aoMudarMes(Number(e.target.value))}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
      >
        {NOMES_MESES.map((nome, indice) => (
          <option key={nome} value={indice + 1}>
            {nome}
          </option>
        ))}
      </select>

      <label className="sr-only" htmlFor="seletor-ano">
        Ano
      </label>
      <select
        id="seletor-ano"
        value={ano}
        onChange={(e) => aoMudarAno(Number(e.target.value))}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
      >
        {ANOS.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>
    </div>
  );
}
