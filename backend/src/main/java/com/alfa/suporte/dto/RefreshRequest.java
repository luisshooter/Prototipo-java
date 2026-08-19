package com.alfa.suporte.dto;

import jakarta.validation.constraints.NotBlank;

public record RefreshRequest(
        @NotBlank(message = "refreshToken e obrigatorio") String refreshToken
) {
}
