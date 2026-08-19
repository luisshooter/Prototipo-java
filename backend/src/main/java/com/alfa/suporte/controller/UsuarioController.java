package com.alfa.suporte.controller;

import com.alfa.suporte.dto.AtualizarPermissoesRequest;
import com.alfa.suporte.dto.UsuarioAdminDTO;
import com.alfa.suporte.service.UsuarioAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Gestao de usuarios e permissoes finas - acesso restrito a ADMIN via SecurityConfig. */
@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioAdminService usuarioAdminService;

    @GetMapping
    public List<UsuarioAdminDTO> listar() {
        return usuarioAdminService.listarTodos();
    }

    @PatchMapping("/{id}/permissoes")
    public UsuarioAdminDTO atualizarPermissoes(@PathVariable Long id, @Valid @RequestBody AtualizarPermissoesRequest request) {
        return usuarioAdminService.atualizarPermissoes(id, request.podeVerDashboard(), request.podeCriarChamado());
    }
}
