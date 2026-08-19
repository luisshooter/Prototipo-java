import { useQuery, useQueryClient } from "@tanstack/react-query";
import { atualizarPermissoes, listarUsuarios } from "../../api/usuarios";
import { mensagemDeErro } from "../../api/client";
import { StateMessage } from "../common/StateMessage";
import type { UsuarioAdmin } from "../../types";

export function PermissoesTab() {
  const queryClient = useQueryClient();

  const usuariosQuery = useQuery({
    queryKey: ["usuarios-admin"],
    queryFn: listarUsuarios,
  });

  async function aoAlternar(usuarioAlvo: UsuarioAdmin, campo: "podeVerDashboard" | "podeCriarChamado") {
    const novoValor = !usuarioAlvo[campo];
    const atualizado: UsuarioAdmin = { ...usuarioAlvo, [campo]: novoValor };

    // atualizacao otimista: a lista responde na hora, sem esperar o servidor
    queryClient.setQueryData<UsuarioAdmin[]>(["usuarios-admin"], (atual) =>
      atual?.map((u) => (u.id === usuarioAlvo.id ? atualizado : u))
    );

    try {
      await atualizarPermissoes(usuarioAlvo.id, atualizado.podeVerDashboard, atualizado.podeCriarChamado);
    } catch {
      // reverte se der erro
      queryClient.setQueryData<UsuarioAdmin[]>(["usuarios-admin"], (atual) =>
        atual?.map((u) => (u.id === usuarioAlvo.id ? usuarioAlvo : u))
      );
    }
  }

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

  return (
    <div>
      <p className="mb-4 text-sm text-slate-500">
        Controla o que cada usuário vê. Perfil <span className="font-medium text-slate-700">ADMIN</span> sempre tem
        acesso completo, independente do que estiver marcado aqui.
      </p>

      <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
        {usuariosQuery.data.map((usuarioItem) => {
          const ehAdmin = usuarioItem.perfis.includes("ADMIN");
          return (
            <div key={usuarioItem.id} className="rounded-lg border border-slate-200 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{usuarioItem.nome}</p>
                  <p className="truncate text-xs text-slate-500">{usuarioItem.email}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    ehAdmin ? "bg-brand-50 text-brand-700" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {usuarioItem.perfis.join(", ")}
                </span>
              </div>

              {ehAdmin ? (
                <p className="text-xs text-slate-400">Acesso total (perfil ADMIN)</p>
              ) : (
                <div className="flex flex-wrap gap-4">
                  <ToggleLinha
                    rotulo="Ver dashboard"
                    ligado={usuarioItem.podeVerDashboard}
                    onClick={() => aoAlternar(usuarioItem, "podeVerDashboard")}
                  />
                  <ToggleLinha
                    rotulo="Criar chamado"
                    ligado={usuarioItem.podeCriarChamado}
                    onClick={() => aoAlternar(usuarioItem, "podeCriarChamado")}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ToggleLinha({ rotulo, ligado, onClick }: { rotulo: string; ligado: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 text-sm text-slate-600"
      aria-pressed={ligado}
    >
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${ligado ? "bg-brand-600" : "bg-slate-300"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            ligado ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </span>
      {rotulo}
    </button>
  );
}
