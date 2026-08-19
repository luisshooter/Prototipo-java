import { api } from "./client";
import type { UsuarioAutenticado } from "../types";

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  accessExpiraEm: string;
  usuario: UsuarioAutenticado;
}

export async function login(email: string, senha: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/api/auth/login", { email, senha });
  return data;
}

export async function logout(refreshToken: string): Promise<void> {
  await api.post("/api/auth/logout", { refreshToken });
}

export async function buscarUsuarioAtual(): Promise<UsuarioAutenticado> {
  const { data } = await api.get<UsuarioAutenticado>("/api/auth/me");
  return data;
}
