import { api } from "./client";
import type { ReceitaResponse } from "../types";

export async function buscarReceitas(prato: string): Promise<ReceitaResponse> {
  const { data } = await api.get<ReceitaResponse>("/api/receitas", {
    params: { prato },
  });
  return data;
}
