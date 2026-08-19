package com.alfa.suporte.dto;

public record ReceitaDTO(
        String publisher,
        String title,
        String sourceUrl,
        String recipeId,
        String imageUrl,
        Double socialRank,
        String publisherUrl
) {
}
