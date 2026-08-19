package com.alfa.suporte.dto;

import java.util.List;

public record UsuarioAdminDTO(
        Long id,
        String nome,
        String email,
        List<String> perfis,
        boolean podeVerDashboard,
        boolean podeCriarChamado
) {
}
