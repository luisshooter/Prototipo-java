package com.alfa.suporte.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/**
 * Representa a credencial de sessao (refresh token) de um usuario.
 * Ciclo de vida: EMITIDA -> VALIDA -> EXPIRADA -> RENOVADA -> REVOGADA.
 */
@Entity
@Table(name = "sessao")
@Getter
@Setter
@NoArgsConstructor
public class Sessao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fk_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "identificador_hash", nullable = false, unique = true, length = 200)
    private String identificadorHash;

    @Column(name = "expira_em", nullable = false)
    private Instant expiraEm;

    @Column(name = "revogado_em")
    private Instant revogadoEm;

    @Column(name = "criado_em", nullable = false)
    private Instant criadoEm = Instant.now();

    public boolean estaValida() {
        return revogadoEm == null && expiraEm.isAfter(Instant.now());
    }
}
