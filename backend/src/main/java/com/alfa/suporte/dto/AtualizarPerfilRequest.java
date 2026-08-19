package com.alfa.suporte.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AtualizarPerfilRequest(
        @NotBlank(message = "nome e obrigatorio") @Size(max = 120) String nome,
        @Size(max = 700_000, message = "imagem muito grande") String avatarBase64
) {
}
