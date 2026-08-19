package com.alfa.suporte.repository;

import com.alfa.suporte.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    /**
     * Retorna apenas a lista materializada de tickets do periodo (sem GROUP BY/COUNT).
     * O agrupamento por cliente e por modulo e calculado na camada de aplicacao.
     */
    @Query("select t from Ticket t join fetch t.cliente join fetch t.modulo " +
            "where t.dataAbertura >= :inicio and t.dataAbertura <= :fim " +
            "order by t.dataAbertura asc")
    List<Ticket> buscarPorPeriodoAbertura(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);
}
