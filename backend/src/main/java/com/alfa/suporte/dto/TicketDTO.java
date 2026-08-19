package com.alfa.suporte.dto;

import java.time.LocalDate;

public record TicketDTO(
        Long codigo,
        String titulo,
        String cliente,
        LocalDate dataAbertura,
        LocalDate dataEncerramento,
        String modulo
) {
}
