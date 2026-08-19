import { api } from "./client";
import type { ReceitaRespostaBruta, ReceitaResponse } from "../types";

export async function buscarReceitas(prato: string): Promise<ReceitaResponse> {
  const { data } = await api.get<ReceitaRespostaBruta>("/api/receitas", {
    params: { prato },
  });

  return {
    count: data.count,
    receitas: data.receitas.map((r) => ({
      publisher: r.publisher,
      title: r.title,
      sourceUrl: r.source_url,
      recipeId: r.recipe_id,
      imageUrl: r.image_url,
      socialRank: r.social_rank,
      publisherUrl: r.publisher_url,
    })),
  };
}
