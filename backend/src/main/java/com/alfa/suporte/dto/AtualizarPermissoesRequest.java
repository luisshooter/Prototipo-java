package com.alfa.suporte.dto;

import jakarta.validation.constraints.NotNull;

public record AtualizarPermissoesRequest(
        @NotNull(message = "podeVerDashboard e obrigatorio") Boolean podeVerDashboard,
        @NotNull(message = "podeCriarChamado e obrigatorio") Boolean podeCriarChamado
) {
}
