import { api } from "./client";
import type { UsuarioAdmin } from "../types";

export async function listarUsuarios(): Promise<UsuarioAdmin[]> {
  const { data } = await api.get<UsuarioAdmin[]>("/api/usuarios");
  return data;
}

export async function atualizarPermissoes(
  id: number,
  podeVerDashboard: boolean,
  podeCriarChamado: boolean
): Promise<UsuarioAdmin> {
  const { data } = await api.patch<UsuarioAdmin>(`/api/usuarios/${id}/permissoes`, {
    podeVerDashboard,
    podeCriarChamado,
  });
  return data;
}
