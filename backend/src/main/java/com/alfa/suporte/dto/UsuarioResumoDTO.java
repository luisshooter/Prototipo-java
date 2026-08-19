package com.alfa.suporte.dto;

import java.util.List;

public record UsuarioResumoDTO(String nome, String email, List<String> perfis) {
}
