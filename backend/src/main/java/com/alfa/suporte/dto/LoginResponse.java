package com.alfa.suporte.dto;

import java.time.Instant;

public record LoginResponse(
        String accessToken,
        String refreshToken,
        Instant accessExpiraEm,
        UsuarioResumoDTO usuario
) {
}
