interface StateMessageProps {
  variant: "carregando" | "vazio" | "erro";
  titulo: string;
  descricao?: string;
  aoTentarNovamente?: () => void;
}

const ICONES: Record<StateMessageProps["variant"], JSX.Element> = {
  carregando: (
    <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-brand-500" />
  ),
  vazio: (
    <svg viewBox="0 0 24 24" fill="none" className="h-9 w-9 text-slate-300">
      <path
        d="M4 7h16M4 12h10M4 17h7"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </svg>
  ),
  erro: (
    <svg viewBox="0 0 24 24" fill="none" className="h-9 w-9 text-rose-400">
      <path
        d="M12 9v4m0 4h.01M10.29 3.86l-8.4 14.55A1.5 1.5 0 0 0 3.19 21h17.62a1.5 1.5 0 0 0 1.3-2.59l-8.4-14.55a1.5 1.5 0 0 0-2.62 0Z"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

export function StateMessage({ variant, titulo, descricao, aoTentarNovamente }: StateMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-white/60 px-6 py-14 text-center">
      {ICONES[variant]}
      <div className="space-y-1">
        <p className="font-display text-sm font-semibold text-slate-700">{titulo}</p>
        {descricao && <p className="max-w-sm text-sm text-slate-500">{descricao}</p>}
      </div>
      {aoTentarNovamente && (
        <button
          onClick={aoTentarNovamente}
          className="mt-1 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-400 hover:text-brand-700"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
