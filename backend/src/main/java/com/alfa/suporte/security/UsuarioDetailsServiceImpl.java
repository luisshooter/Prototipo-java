package com.alfa.suporte.security;

import com.alfa.suporte.entity.Usuario;
import com.alfa.suporte.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioDetailsServiceImpl implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String email) {
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(email)
                .filter(Usuario::isAtivo)
                .orElseThrow(() -> new UsernameNotFoundException("Credenciais invalidas"));

        List<SimpleGrantedAuthority> authorities = usuario.getPerfis().stream()
                .map(p -> new SimpleGrantedAuthority("ROLE_" + p.getNome()))
                .toList();

        return new User(usuario.getEmail(), usuario.getSenhaHash(), authorities);
    }
}
