import { api } from "./client";
import type { Cliente, DashboardData, Modulo, NovoTicketPayload, Ticket } from "../types";

export async function buscarDashboard(mes: number, ano: number): Promise<DashboardData> {
  const { data } = await api.get<DashboardData>("/api/tickets/dashboard", {
    params: { mes, ano },
  });
  return data;
}

export async function criarTicket(payload: NovoTicketPayload): Promise<Ticket> {
  const { data } = await api.post<Ticket>("/api/tickets", payload);
  return data;
}

export async function listarClientes(): Promise<Cliente[]> {
  const { data } = await api.get<Cliente[]>("/api/clientes");
  return data;
}

export async function listarModulos(): Promise<Modulo[]> {
  const { data } = await api.get<Modulo[]>("/api/modulos");
  return data;
}
