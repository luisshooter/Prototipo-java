import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { Agrupamento } from "../../types";

const CORES = ["#0d9488", "#f59e0b", "#e11d48", "#6366f1", "#0ea5e9", "#84cc16"];

interface PieChartCardProps {
  titulo: string;
  dados: Agrupamento[];
}

export function PieChartCard({ titulo, dados }: PieChartCardProps) {
  const total = dados.reduce((soma, item) => soma + item.quantidade, 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="mb-1 flex items-baseline justify-between">
        <h3 className="font-display text-sm font-semibold text-slate-700">{titulo}</h3>
        <span className="font-mono text-xs text-slate-400">{total} chamado{total === 1 ? "" : "s"}</span>
      </div>

      {total === 0 ? (
        <div className="flex h-52 items-center justify-center text-sm text-slate-400">
          Sem dados para este período
        </div>
      ) : (
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dados}
                dataKey="quantidade"
                nameKey="nome"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={2}
                strokeWidth={0}
              >
                {dados.map((entrada, indice) => (
                  <Cell key={entrada.nome} fill={CORES[indice % CORES.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(valor: number, nome: string) => [`${valor} chamados`, nome]}
                contentStyle={{ borderRadius: 10, borderColor: "#e2e8f0", fontSize: 13 }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12.5, color: "#475569" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
