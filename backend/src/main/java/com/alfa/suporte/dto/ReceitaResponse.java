package com.alfa.suporte.dto;

import java.util.List;

public record ReceitaResponse(int count, List<ReceitaDTO> receitas) {
}
