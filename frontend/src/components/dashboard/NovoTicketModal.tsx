import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { criarTicket, listarClientes, listarModulos } from "../../api/tickets";
import { mensagemDeErro } from "../../api/client";

interface NovoTicketModalProps {
  aberto: boolean;
  aoFechar: () => void;
}

export function NovoTicketModal({ aberto, aoFechar }: NovoTicketModalProps) {
  const queryClient = useQueryClient();

  const [titulo, setTitulo] = useState("");
  const [codCliente, setCodCliente] = useState("");
  const [codModulo, setCodModulo] = useState("");
  const [dataAbertura, setDataAbertura] = useState(() => new Date().toISOString().slice(0, 10));
  const [dataEncerramento, setDataEncerramento] = useState("");
  const [erroValidacao, setErroValidacao] = useState<string | null>(null);

  const clientesQuery = useQuery({ queryKey: ["clientes"], queryFn: listarClientes, enabled: aberto });
  const modulosQuery = useQuery({ queryKey: ["modulos"], queryFn: listarModulos, enabled: aberto });

  const mutation = useMutation({
    mutationFn: criarTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      limparEFechar();
    },
  });

  function limparEFechar() {
    setTitulo("");
    setCodCliente("");
    setCodModulo("");
    setDataEncerramento("");
    setErroValidacao(null);
    aoFechar();
  }

  function aoSubmeter(evento: FormEvent) {
    evento.preventDefault();
    setErroValidacao(null);

    if (!titulo.trim() || !codCliente || !codModulo || !dataAbertura) {
      setErroValidacao("Preencha título, cliente, módulo e data de abertura.");
      return;
    }
    if (dataEncerramento && dataEncerramento < dataAbertura) {
      setErroValidacao("A data de encerramento não pode ser anterior à data de abertura.");
      return;
    }

    mutation.mutate({
      titulo: titulo.trim(),
      codCliente: Number(codCliente),
      codModulo: Number(codModulo),
      dataAbertura,
      dataEncerramento: dataEncerramento || null,
    });
  }

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-slate-800">Novo chamado</h2>
            <p className="text-sm text-slate-500">Restrito ao perfil ADMIN.</p>
          </div>
          <button
            onClick={limparEFechar}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Fechar"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={aoSubmeter} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="titulo">
              Título
            </label>
            <input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: Falha na conciliação bancária"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="cliente">
                Cliente
              </label>
              <select
                id="cliente"
                value={codCliente}
                onChange={(e) => setCodCliente(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">Selecione</option>
                {clientesQuery.data?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="modulo">
                Módulo
              </label>
              <select
                id="modulo"
                value={codModulo}
                onChange={(e) => setCodModulo(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">Selecione</option>
                {modulosQuery.data?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="abertura">
                Data de abertura
              </label>
              <input
                id="abertura"
                type="date"
                value={dataAbertura}
                onChange={(e) => setDataAbertura(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="encerramento">
                Encerramento (opcional)
              </label>
              <input
                id="encerramento"
                type="date"
                value={dataEncerramento}
                onChange={(e) => setDataEncerramento(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          {(erroValidacao || mutation.isError) && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {erroValidacao ?? mensagemDeErro(mutation.error)}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={limparEFechar}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
            >
              {mutation.isPending ? "Salvando…" : "Criar chamado"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
