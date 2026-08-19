import { useEffect, useState } from "react";
import type { Receita } from "../../types";

const ITENS_POR_PAGINA = 6;

interface ReceitaCarouselProps {
  receitas: Receita[];
}

export function ReceitaCarousel({ receitas }: ReceitaCarouselProps) {
  const totalPaginas = Math.max(1, Math.ceil(receitas.length / ITENS_POR_PAGINA));
  const [pagina, setPagina] = useState(0);

  // nova busca sempre volta para a primeira pagina
  useEffect(() => {
    setPagina(0);
  }, [receitas]);

  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === "ArrowRight") irPara(pagina + 1);
      if (evento.key === "ArrowLeft") irPara(pagina - 1);
    }
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina, totalPaginas]);

  function irPara(alvo: number) {
    setPagina(Math.min(Math.max(alvo, 0), totalPaginas - 1));
  }

  const paginas = Array.from({ length: totalPaginas }, (_, indice) =>
    receitas.slice(indice * ITENS_POR_PAGINA, indice * ITENS_POR_PAGINA + ITENS_POR_PAGINA)
  );

  return (
    <div>
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)]"
          style={{ transform: `translateX(-${pagina * 100}%)` }}
        >
          {paginas.map((grupo, indice) => (
            <div
              key={indice}
              aria-hidden={indice !== pagina}
              className="grid w-full shrink-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {grupo.map((receita, posicao) => (
                <CardReceita key={receita.recipeId} receita={receita} atraso={posicao} ativo={indice === pagina} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {totalPaginas > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <BotaoSeta direcao="esquerda" onClick={() => irPara(pagina - 1)} desabilitado={pagina === 0} />

          <div className="flex items-center gap-1.5">
            {paginas.map((_, indice) => (
              <button
                key={indice}
                onClick={() => irPara(indice)}
                aria-label={`Ir para pagina ${indice + 1}`}
                aria-current={indice === pagina}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  indice === pagina ? "w-6 bg-brand-600" : "w-1.5 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>

          <BotaoSeta direcao="direita" onClick={() => irPara(pagina + 1)} desabilitado={pagina === totalPaginas - 1} />
        </div>
      )}

      {totalPaginas > 1 && (
        <p className="mt-2 text-center font-mono text-xs text-slate-400">
          {pagina + 1} / {totalPaginas}
        </p>
      )}
    </div>
  );
}

function BotaoSeta({
  direcao,
  onClick,
  desabilitado,
}: {
  direcao: "esquerda" | "direita";
  onClick: () => void;
  desabilitado: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={desabilitado}
      aria-label={direcao === "esquerda" ? "Pagina anterior" : "Proxima pagina"}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition duration-200 hover:border-brand-400 hover:text-brand-700 hover:shadow disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-500 disabled:hover:shadow-sm"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
        {direcao === "esquerda" ? (
          <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}

function CardReceita({ receita, atraso, ativo }: { receita: Receita; atraso: number; ativo: boolean }) {
  return (
    <a
      href={receita.sourceUrl}
      target="_blank"
      rel="noreferrer"
      tabIndex={ativo ? 0 : -1}
      style={{ transitionDelay: ativo ? `${atraso * 40}ms` : "0ms" }}
      className={`group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
        ativo ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
      }`}
    >
      <div className="aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={receita.imageUrl}
          alt={receita.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 font-display text-sm font-semibold text-slate-800">{receita.title}</h3>
        <p className="mt-1 text-xs text-slate-500">{receita.publisher}</p>
      </div>
    </a>
  );
}
