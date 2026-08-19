package com.alfa.suporte.repository;

import com.alfa.suporte.entity.Sessao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SessaoRepository extends JpaRepository<Sessao, Long> {

    Optional<Sessao> findByIdentificadorHash(String identificadorHash);
}
