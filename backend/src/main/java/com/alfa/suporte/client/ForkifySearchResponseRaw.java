package com.alfa.suporte.client;

import java.util.List;

/** Espelha o payload bruto da forkify-api. */
public record ForkifySearchResponseRaw(int count, List<ForkifyRecipeRaw> recipes) {
}
