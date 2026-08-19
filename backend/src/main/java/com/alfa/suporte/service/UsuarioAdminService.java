package com.alfa.suporte.service;

import com.alfa.suporte.dto.UsuarioAdminDTO;
import com.alfa.suporte.entity.Perfil;
import com.alfa.suporte.entity.Usuario;
import com.alfa.suporte.exception.RecursoNaoEncontradoException;
import com.alfa.suporte.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Gestao (por ADMIN) das permissoes finas de cada usuario. */
@Service
@RequiredArgsConstructor
public class UsuarioAdminService {

    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public List<UsuarioAdminDTO> listarTodos() {
        return usuarioRepository.findAll().stream().map(this::paraDTO).toList();
    }

    @Transactional
    public UsuarioAdminDTO atualizarPermissoes(Long id, boolean podeVerDashboard, boolean podeCriarChamado) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuario %d nao encontrado".formatted(id)));

        usuario.setPodeVerDashboard(podeVerDashboard);
        usuario.setPodeCriarChamado(podeCriarChamado);
        usuarioRepository.save(usuario);

        return paraDTO(usuario);
    }

    private UsuarioAdminDTO paraDTO(Usuario usuario) {
        return new UsuarioAdminDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfis().stream().map(Perfil::getNome).toList(),
                usuario.isPodeVerDashboard(),
                usuario.isPodeCriarChamado()
        );
    }
}
