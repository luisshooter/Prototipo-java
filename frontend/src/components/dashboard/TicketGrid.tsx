import type { Ticket } from "../../types";
import { formatarDataBr } from "../../utils/date";

export function TicketGrid({ tickets }: { tickets: Ticket[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
            <th className="px-4 py-3 font-medium">Código</th>
            <th className="px-4 py-3 font-medium">Título</th>
            <th className="px-4 py-3 font-medium">Cliente</th>
            <th className="px-4 py-3 font-medium">Abertura</th>
            <th className="px-4 py-3 font-medium">Encerramento</th>
            <th className="px-4 py-3 font-medium">Módulo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tickets.map((ticket) => (
            <tr key={ticket.codigo} className="transition hover:bg-slate-50/80">
              <td className="px-4 py-3 font-mono text-xs text-slate-500">#{ticket.codigo}</td>
              <td className="px-4 py-3 font-medium text-slate-700">{ticket.titulo}</td>
              <td className="px-4 py-3 text-slate-600">{ticket.cliente}</td>
              <td className="px-4 py-3 font-mono text-xs tabular-nums text-slate-500">
                {formatarDataBr(ticket.dataAbertura)}
              </td>
              <td className="px-4 py-3 font-mono text-xs tabular-nums text-slate-500">
                {ticket.dataEncerramento ? (
                  formatarDataBr(ticket.dataEncerramento)
                ) : (
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 font-sans text-[11px] font-medium text-amber-700">
                    Em aberto
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {ticket.modulo}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
