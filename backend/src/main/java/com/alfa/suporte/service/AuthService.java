package com.alfa.suporte.service;

import com.alfa.suporte.dto.LoginResponse;
import com.alfa.suporte.dto.UsuarioResumoDTO;
import com.alfa.suporte.entity.Perfil;
import com.alfa.suporte.entity.Sessao;
import com.alfa.suporte.entity.Usuario;
import com.alfa.suporte.exception.CredencialInvalidaException;
import com.alfa.suporte.repository.SessaoRepository;
import com.alfa.suporte.repository.UsuarioRepository;
import com.alfa.suporte.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;

/**
 * Orquestra o ciclo de vida da credencial: EMITIDA -> VALIDA -> EXPIRADA -> RENOVADA -> REVOGADA.
 *
 * O token de acesso e um JWT stateless de curta duracao. O refresh token e opaco,
 * gerado com SecureRandom; apenas o hash SHA-256 dele e persistido na tabela SESSAO,
 * o que permite revogacao efetiva (logout) e deteccao de reuso sem guardar o segredo em claro.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final SessaoRepository sessaoRepository;
    private final JwtService jwtService;

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    @Transactional
    public LoginResponse login(String email, String senha) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, senha));

        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new CredencialInvalidaException("E-mail ou senha invalidos"));

        return montarResposta(usuario);
    }

    @Transactional
    public LoginResponse refresh(String refreshTokenPlano) {
        String hash = sha256(refreshTokenPlano);

        Sessao sessao = sessaoRepository.findByIdentificadorHash(hash)
                .orElseThrow(() -> new CredencialInvalidaException("Sessao invalida ou expirada"));

        if (!sessao.estaValida()) {
            throw new CredencialInvalidaException("Sessao invalida ou expirada");
        }

        // renovacao: a sessao antiga e revogada e uma nova credencial e emitida (rotacao de refresh token)
        sessao.setRevogadoEm(Instant.now());
        sessaoRepository.save(sessao);

        return montarResposta(sessao.getUsuario());
    }

    @Transactional
    public void logout(String refreshTokenPlano) {
        String hash = sha256(refreshTokenPlano);
        sessaoRepository.findByIdentificadorHash(hash).ifPresent(sessao -> {
            sessao.setRevogadoEm(Instant.now());
            sessaoRepository.save(sessao);
        });
    }

    @Transactional(readOnly = true)
    public UsuarioResumoDTO buscarPerfilAtual(String email) {
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new CredencialInvalidaException("Credencial invalida"));
        return paraResumo(usuario);
    }

    private LoginResponse montarResposta(Usuario usuario) {
        String accessToken = jwtService.gerarAccessToken(usuario);
        String refreshTokenPlano = criarNovaSessao(usuario);
        Instant expiraEm = Instant.now().plusMillis(jwtService.getAccessExpirationMs());

        return new LoginResponse(accessToken, refreshTokenPlano, expiraEm, paraResumo(usuario));
    }

    private String criarNovaSessao(Usuario usuario) {
        String tokenPlano = gerarTokenAleatorio();

        Sessao sessao = new Sessao();
        sessao.setUsuario(usuario);
        sessao.setIdentificadorHash(sha256(tokenPlano));
        sessao.setExpiraEm(Instant.now().plusMillis(refreshExpirationMs));
        sessaoRepository.save(sessao);

        return tokenPlano;
    }

    private UsuarioResumoDTO paraResumo(Usuario usuario) {
        return new UsuarioResumoDTO(
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfis().stream().map(Perfil::getNome).toList(),
                usuario.getAvatarBase64()
        );
    }

    @Transactional
    public UsuarioResumoDTO atualizarPerfil(String email, String nome, String avatarBase64) {
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new CredencialInvalidaException("Credencial invalida"));

        usuario.setNome(nome);
        usuario.setAvatarBase64(avatarBase64);
        usuarioRepository.save(usuario);

        return paraResumo(usuario);
    }

    private String gerarTokenAleatorio() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String sha256(String valor) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(valor.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Algoritmo SHA-256 indisponivel", e);
        }
    }
}
