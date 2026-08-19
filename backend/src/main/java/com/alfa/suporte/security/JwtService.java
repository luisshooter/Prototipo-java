package com.alfa.suporte.security;

import com.alfa.suporte.entity.Perfil;
import com.alfa.suporte.entity.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

/** Emissao e validacao do token de acesso (JWT), de curta duracao. */
@Service
public class JwtService {

    private final SecretKey key;
    private final long accessExpirationMs;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                       @Value("${app.jwt.access-expiration-ms}") long accessExpirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessExpirationMs = accessExpirationMs;
    }

    public String gerarAccessToken(Usuario usuario) {
        Instant agora = Instant.now();
        List<String> perfis = usuario.getPerfis().stream().map(Perfil::getNome).collect(Collectors.toList());

        return Jwts.builder()
                .subject(usuario.getEmail())
                .claim("nome", usuario.getNome())
                .claim("perfis", perfis)
                .issuedAt(Date.from(agora))
                .expiration(Date.from(agora.plusMillis(accessExpirationMs)))
                .signWith(key)
                .compact();
    }

    public long getAccessExpirationMs() {
        return accessExpirationMs;
    }

    /** @throws JwtException se o token for invalido, malformado ou estiver expirado. */
    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
