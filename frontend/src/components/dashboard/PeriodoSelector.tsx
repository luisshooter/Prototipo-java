import { NOMES_MESES } from "../../utils/date";

interface PeriodoSelectorProps {
  mes: number;
  ano: number;
  aoMudarMes: (mes: number) => void;
  aoMudarAno: (ano: number) => void;
}

const AGORA = new Date();
const MES_ATUAL = AGORA.getMonth() + 1;
const ANO_ATUAL = AGORA.getFullYear();
const ANOS = Array.from({ length: 8 }, (_, i) => ANO_ATUAL - 6 + i);

export function PeriodoSelector({ mes, ano, aoMudarMes, aoMudarAno }: PeriodoSelectorProps) {
  const noPeriodoAtual = mes === MES_ATUAL && ano === ANO_ATUAL;
  const depoisDoAtual = ano > ANO_ATUAL || (ano === ANO_ATUAL && mes > MES_ATUAL);

  function irParaPeriodoAdjacente(direcao: -1 | 1) {
    let novoMes = mes + direcao;
    let novoAno = ano;
    if (novoMes < 1) {
      novoMes = 12;
      novoAno -= 1;
    } else if (novoMes > 12) {
      novoMes = 1;
      novoAno += 1;
    }
    aoMudarMes(novoMes);
    aoMudarAno(novoAno);
  }

  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
      <button
        type="button"
        onClick={() => irParaPeriodoAdjacente(-1)}
        aria-label="Período anterior"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
          <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="flex items-center gap-px">
        <label className="sr-only" htmlFor="seletor-mes">
          Mês
        </label>
        <select
          id="seletor-mes"
          value={mes}
          onChange={(e) => aoMudarMes(Number(e.target.value))}
          className="cursor-pointer rounded-md border-0 bg-transparent py-1 pl-2 pr-1 text-sm font-medium text-slate-700 outline-none transition hover:bg-slate-100 focus:ring-2 focus:ring-brand-500/20"
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
          className="cursor-pointer rounded-md border-0 bg-transparent py-1 pl-1 pr-2 text-sm font-medium text-slate-700 outline-none transition hover:bg-slate-100 focus:ring-2 focus:ring-brand-500/20"
        >
          {ANOS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={() => irParaPeriodoAdjacente(1)}
        disabled={depoisDoAtual}
        aria-label="Próximo período"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {!noPeriodoAtual && (
        <button
          type="button"
          onClick={() => {
            aoMudarMes(MES_ATUAL);
            aoMudarAno(ANO_ATUAL);
          }}
          className="ml-1 shrink-0 rounded-md px-2 py-1 text-xs font-medium text-brand-700 transition hover:bg-brand-50"
        >
          Hoje
        </button>
      )}
    </div>
  );
}
