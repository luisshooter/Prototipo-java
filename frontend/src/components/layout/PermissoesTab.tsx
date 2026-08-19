import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { atualizarPermissoes, listarUsuarios } from "../../api/usuarios";
import { mensagemDeErro } from "../../api/client";
import { StateMessage } from "../common/StateMessage";
import type { UsuarioAdmin } from "../../types";

const CORES_AVATAR = ["bg-brand-600", "bg-sky-600", "bg-violet-600", "bg-amber-600", "bg-rose-600", "bg-teal-600"];

function corAvatar(nome: string): string {
  let soma = 0;
  for (let i = 0; i < nome.length; i++) soma += nome.charCodeAt(i);
  return CORES_AVATAR[soma % CORES_AVATAR.length];
}

export function PermissoesTab() {
  const queryClient = useQueryClient();
  const [busca, setBusca] = useState("");
  const [erroLinha, setErroLinha] = useState<Record<number, string>>({});

  const usuariosQuery = useQuery({
    queryKey: ["usuarios-admin"],
    queryFn: listarUsuarios,
  });

  async function aoAlternar(usuarioAlvo: UsuarioAdmin, campo: "podeVerDashboard" | "podeCriarChamado") {
    const novoValor = !usuarioAlvo[campo];
    const atualizado: UsuarioAdmin = { ...usuarioAlvo, [campo]: novoValor };

    setErroLinha((atual) => {
      const { [usuarioAlvo.id]: _omitir, ...resto } = atual;
      return resto;
    });

    // atualizacao otimista: a lista responde na hora, sem esperar o servidor
    queryClient.setQueryData<UsuarioAdmin[]>(["usuarios-admin"], (atual) =>
      atual?.map((u) => (u.id === usuarioAlvo.id ? atualizado : u))
    );

    try {
      await atualizarPermissoes(usuarioAlvo.id, atualizado.podeVerDashboard, atualizado.podeCriarChamado);
    } catch (erro) {
      // reverte se der erro, e explica o motivo na linha
      queryClient.setQueryData<UsuarioAdmin[]>(["usuarios-admin"], (atual) =>
        atual?.map((u) => (u.id === usuarioAlvo.id ? usuarioAlvo : u))
      );
      setErroLinha((atual) => ({ ...atual, [usuarioAlvo.id]: mensagemDeErro(erro, "Não foi possível salvar.") }));
    }
  }

  const usuariosFiltrados = useMemo(() => {
    if (!usuariosQuery.data) return [];
    const termo = busca.trim().toLowerCase();
    if (!termo) return usuariosQuery.data;
    return usuariosQuery.data.filter(
      (u) => u.nome.toLowerCase().includes(termo) || u.email.toLowerCase().includes(termo)
    );
  }, [usuariosQuery.data, busca]);

  if (usuariosQuery.isPending) {
    return <StateMessage variant="carregando" titulo="Carregando usuários…" />;
  }

  if (usuariosQuery.isError) {
    return (
      <StateMessage
        variant="erro"
        titulo="Não foi possível carregar os usuários"
        descricao={mensagemDeErro(usuariosQuery.error)}
        aoTentarNovamente={() => usuariosQuery.refetch()}
      />
    );
  }

  const totalComDashboard = usuariosQuery.data.filter((u) => u.perfis.includes("ADMIN") || u.podeVerDashboard).length;

  return (
    <div>
      <p className="mb-4 text-sm text-slate-500">
        Controla o que cada usuário vê. Perfil <span className="font-medium text-slate-700">ADMIN</span> sempre tem
        acesso completo, independente do que estiver marcado aqui.
      </p>

      <div className="mb-3 flex items-center gap-3">
        <div className="relative flex-1">
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth={1.7} />
            <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" />
          </svg>
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou e-mail…"
            className="w-full rounded-lg border border-slate-200 py-1.5 pl-8 pr-3 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <span className="shrink-0 whitespace-nowrap text-xs text-slate-400">
          {totalComDashboard}/{usuariosQuery.data.length} veem o dashboard
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="grid grid-cols-[1fr_5.5rem_5.5rem] items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          <span>Usuário</span>
          <span className="text-center leading-tight">Dashboard</span>
          <span className="text-center leading-tight">Novo chamado</span>
        </div>

        <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto">
          {usuariosFiltrados.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-400">Nenhum usuário encontrado.</p>
          ) : (
            usuariosFiltrados.map((usuarioItem) => {
              const ehAdmin = usuarioItem.perfis.includes("ADMIN");
              return (
                <div key={usuarioItem.id}>
                  <div className="grid grid-cols-[1fr_5.5rem_5.5rem] items-center gap-2 px-4 py-2.5 transition hover:bg-slate-50/60">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${corAvatar(
                          usuarioItem.nome
                        )}`}
                      >
                        {usuarioItem.nome.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-medium text-slate-800">{usuarioItem.nome}</p>
                          <span
                            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                              ehAdmin ? "bg-brand-50 text-brand-700" : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {ehAdmin ? "ADMIN" : "USER"}
                          </span>
                        </div>
                        <p className="truncate text-xs text-slate-500">{usuarioItem.email}</p>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      {ehAdmin ? (
                        <TravaSempreAtiva />
                      ) : (
                        <Toggle
                          ligado={usuarioItem.podeVerDashboard}
                          aoClicar={() => aoAlternar(usuarioItem, "podeVerDashboard")}
                          rotulo={`Alternar acesso ao dashboard de ${usuarioItem.nome}`}
                        />
                      )}
                    </div>

                    <div className="flex justify-center">
                      {ehAdmin ? (
                        <TravaSempreAtiva />
                      ) : (
                        <Toggle
                          ligado={usuarioItem.podeCriarChamado}
                          aoClicar={() => aoAlternar(usuarioItem, "podeCriarChamado")}
                          rotulo={`Alternar permissão de criar chamado de ${usuarioItem.nome}`}
                        />
                      )}
                    </div>
                  </div>
                  {erroLinha[usuarioItem.id] && (
                    <p className="px-4 pb-2 text-xs text-rose-600">{erroLinha[usuarioItem.id]}</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function Toggle({ ligado, aoClicar, rotulo }: { ligado: boolean; aoClicar: () => void; rotulo: string }) {
  return (
    <button
      type="button"
      onClick={aoClicar}
      aria-pressed={ligado}
      aria-label={rotulo}
      title={rotulo}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 ${
        ligado ? "bg-brand-600" : "bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-150 ${
          ligado ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function TravaSempreAtiva() {
  return (
    <span
      className="flex h-5 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-400"
      title="Sempre ativo para o perfil ADMIN"
    >
      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none">
        <rect x="5" y="10" width="14" height="9" rx="2" stroke="currentColor" strokeWidth={2} />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      </svg>
    </span>
  );
}
