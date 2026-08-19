package com.alfa.suporte.client;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ForkifyRecipeRaw(
        String publisher,
        String title,
        @JsonProperty("source_url") String sourceUrl,
        @JsonProperty("recipe_id") String recipeId,
        @JsonProperty("image_url") String imageUrl,
        @JsonProperty("social_rank") Double socialRank,
        @JsonProperty("publisher_url") String publisherUrl
) {
}
