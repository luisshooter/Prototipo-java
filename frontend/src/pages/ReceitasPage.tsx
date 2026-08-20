import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { AppShell } from "../components/layout/AppShell";
import { StateMessage } from "../components/common/StateMessage";
import { ReceitaCarousel } from "../components/receitas/ReceitaCarousel";
import { buscarReceitas } from "../api/receitas";
import { mensagemDeErro } from "../api/client";

const SUGESTOES = ["Pizza", "Lasanha", "Sushi", "Hambúrguer", "Tacos", "Bolo de chocolate"];

export function ReceitasPage() {
  const [prato, setPrato] = useState("");
  const [buscou, setBuscou] = useState(false);

  const mutation = useMutation({ mutationFn: buscarReceitas });

  function buscar(termo: string) {
    if (!termo.trim()) return;
    setPrato(termo);
    setBuscou(true);
    mutation.mutate(termo.trim());
  }

  function aoSubmeter(evento: FormEvent) {
    evento.preventDefault();
    buscar(prato);
  }

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-slate-900">Busca de receitas</h1>
        <p className="mt-1 text-sm text-slate-500">Consulta em tempo real ao serviço externo forkify, via back-end.</p>
      </div>

      <form onSubmit={aoSubmeter} className="mb-4 flex max-w-lg gap-2">
        <input
          value={prato}
          onChange={(e) => setPrato(e.target.value)}
          placeholder="Ex.: pizza, lasanha, salada…"
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
        >
          {mutation.isPending ? "Buscando…" : "Buscar"}
        </button>
      </form>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-400">Mais buscados:</span>
        {SUGESTOES.map((sugestao) => (
          <button
            key={sugestao}
            type="button"
            onClick={() => buscar(sugestao)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              prato === sugestao && mutation.isSuccess
                ? "border-brand-200 bg-brand-50 text-brand-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700"
            }`}
          >
            {sugestao}
          </button>
        ))}
      </div>

      {mutation.isPending && <StateMessage variant="carregando" titulo="Consultando receitas…" />}

      {mutation.isError && (
        <StateMessage
          variant="erro"
          titulo="Não foi possível buscar receitas agora"
          descricao={mensagemDeErro(mutation.error, "O serviço de receitas está indisponível no momento.")}
          aoTentarNovamente={() => mutation.mutate(prato.trim())}
        />
      )}

      {mutation.isSuccess && mutation.data.receitas.length === 0 && (
        <StateMessage variant="vazio" titulo="Nenhum resultado" descricao={`Não encontramos receitas para "${prato}".`} />
      )}

      {mutation.isSuccess && mutation.data.receitas.length > 0 && (
        <>
          <p className="mb-4 text-sm text-slate-500">
            {mutation.data.count} receita{mutation.data.count === 1 ? "" : "s"} encontrada{mutation.data.count === 1 ? "" : "s"}
          </p>
          <ReceitaCarousel receitas={mutation.data.receitas} />
        </>
      )}

      {!buscou && !mutation.isPending && (
        <StateMessage variant="vazio" titulo="Busque um prato" descricao="Digite o nome de um prato acima ou escolha uma sugestão." />
      )}
    </AppShell>
  );
}
