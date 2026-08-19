package com.alfa.suporte.dto;

import java.util.List;

public record DashboardResponse(
        List<TicketDTO> tickets,
        List<AgrupamentoDTO> porCliente,
        List<AgrupamentoDTO> porModulo
) {
}
