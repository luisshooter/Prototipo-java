package com.alfa.suporte.service;

import com.alfa.suporte.entity.Perfil;
import com.alfa.suporte.entity.Usuario;
import com.alfa.suporte.exception.CredencialInvalidaException;
import com.alfa.suporte.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Checagem centralizada das permissoes finas (por usuario) que ficam por cima
 * do perfil. ADMIN sempre passa, independente das flags - elas so restringem
 * usuarios USER.
 */
@Service
@RequiredArgsConstructor
public class PermissaoService {

    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public void exigirVerDashboard(String email) {
        Usuario usuario = buscar(email);
        if (!isAdmin(usuario) && !usuario.isPodeVerDashboard()) {
            throw new AccessDeniedException("Voce nao tem permissao para ver o dashboard");
        }
    }

    @Transactional(readOnly = true)
    public void exigirCriarChamado(String email) {
        Usuario usuario = buscar(email);
        if (!isAdmin(usuario) && !usuario.isPodeCriarChamado()) {
            throw new AccessDeniedException("Voce nao tem permissao para criar chamados");
        }
    }

    private Usuario buscar(String email) {
        return usuarioRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new CredencialInvalidaException("Credencial invalida"));
    }

    private boolean isAdmin(Usuario usuario) {
        return usuario.getPerfis().stream().anyMatch(p -> Perfil.ADMIN.equals(p.getNome()));
    }
}
