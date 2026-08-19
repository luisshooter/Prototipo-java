package com.alfa.suporte.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CriarTicketRequest(
        @NotBlank(message = "titulo e obrigatorio") String titulo,
        @NotNull(message = "codCliente e obrigatorio") Long codCliente,
        @NotNull(message = "codModulo e obrigatorio") Long codModulo,
        @NotNull(message = "dataAbertura e obrigatoria") LocalDate dataAbertura,
        LocalDate dataEncerramento
) {
}
