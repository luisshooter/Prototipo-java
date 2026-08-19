import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "../components/layout/AppShell";
import { PeriodoSelector } from "../components/dashboard/PeriodoSelector";
import { PieChartCard } from "../components/dashboard/PieChartCard";
import { TicketGrid } from "../components/dashboard/TicketGrid";
import { NovoTicketModal } from "../components/dashboard/NovoTicketModal";
import { StateMessage } from "../components/common/StateMessage";
import { buscarDashboard } from "../api/tickets";
import { mensagemDeErro } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export function DashboardPage() {
  const agora = new Date();
  const [mes, setMes] = useState(agora.getMonth() + 1);
  const [ano, setAno] = useState(agora.getFullYear());
  const [modalAberto, setModalAberto] = useState(false);
  const { possuiPerfil } = useAuth();

  const dashboardQuery = useQuery({
    queryKey: ["dashboard", mes, ano],
    queryFn: () => buscarDashboard(mes, ano),
  });

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">Dashboard de chamados</h1>
          <p className="mt-1 text-sm text-slate-500">Volume de chamados por cliente, por módulo e a lista do período.</p>
        </div>
        <PeriodoSelector mes={mes} ano={ano} aoMudarMes={setMes} aoMudarAno={setAno} />
      </div>

      {dashboardQuery.isPending && (
        <StateMessage variant="carregando" titulo="Carregando chamados…" />
      )}

      {dashboardQuery.isError && (
        <StateMessage
          variant="erro"
          titulo="Não foi possível carregar o dashboard"
          descricao={mensagemDeErro(dashboardQuery.error)}
          aoTentarNovamente={() => dashboardQuery.refetch()}
        />
      )}

      {dashboardQuery.data && (
        <div className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <PieChartCard titulo="Chamados por cliente" dados={dashboardQuery.data.porCliente} />
            <PieChartCard titulo="Chamados por módulo" dados={dashboardQuery.data.porModulo} />
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-sm font-semibold text-slate-700">Chamados do período</h2>
              {possuiPerfil("ADMIN") && (
                <button
                  onClick={() => setModalAberto(true)}
                  className="rounded-lg bg-brand-600 px-3.5 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
                >
                  + Novo chamado
                </button>
              )}
            </div>

            {dashboardQuery.data.tickets.length === 0 ? (
              <StateMessage variant="vazio" titulo="Nenhum chamado neste período" descricao="Escolha outro mês/ano ou registre um novo chamado." />
            ) : (
              <TicketGrid tickets={dashboardQuery.data.tickets} />
            )}
          </div>
        </div>
      )}

      <NovoTicketModal aberto={modalAberto} aoFechar={() => setModalAberto(false)} />
    </AppShell>
  );
}
