package com.alfa.suporte.service;

import com.alfa.suporte.dto.AgrupamentoDTO;
import com.alfa.suporte.dto.DashboardResponse;
import com.alfa.suporte.dto.TicketDTO;
import com.alfa.suporte.entity.Ticket;
import com.alfa.suporte.exception.RegraNegocioException;
import com.alfa.suporte.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Camada de aplicacao responsavel pelo dashboard de chamados.
 *
 * Restricao do enunciado: os agrupamentos por cliente e por modulo NAO podem vir de
 * GROUP BY / COUNT agregado no banco. O repositorio devolve apenas a lista de tickets
 * do periodo (ja com cliente/modulo materializados) e todo o agrupamento e feito aqui,
 * em memoria, com Streams.
 */
@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final int ANO_MINIMO = 2000;
    private static final int ANO_MAXIMO = 2100;

    private final TicketRepository ticketRepository;

    @Transactional(readOnly = true)
    public DashboardResponse montarDashboard(Integer mes, Integer ano) {
        validarPeriodo(mes, ano);

        YearMonth periodo = YearMonth.of(ano, mes);
        LocalDate inicio = periodo.atDay(1);
        LocalDate fim = periodo.atEndOfMonth();

        List<Ticket> ticketsDoPeriodo = ticketRepository.buscarPorPeriodoAbertura(inicio, fim);

        List<TicketDTO> tickets = ticketsDoPeriodo.stream()
                .map(this::paraDTO)
                .toList();

        List<AgrupamentoDTO> porCliente = agrupar(ticketsDoPeriodo, t -> t.getCliente().getNome());
        List<AgrupamentoDTO> porModulo = agrupar(ticketsDoPeriodo, t -> t.getModulo().getNome());

        return new DashboardResponse(tickets, porCliente, porModulo);
    }

    /** Agrupamento em memoria: nenhuma agregacao acontece no banco. */
    private List<AgrupamentoDTO> agrupar(List<Ticket> tickets, java.util.function.Function<Ticket, String> chave) {
        Map<String, Long> contagem = tickets.stream()
                .collect(Collectors.groupingBy(chave, Collectors.counting()));

        return contagem.entrySet().stream()
                .map(e -> new AgrupamentoDTO(e.getKey(), e.getValue()))
                .sorted(Comparator.comparing(AgrupamentoDTO::nome))
                .toList();
    }

    private TicketDTO paraDTO(Ticket t) {
        return new TicketDTO(
                t.getId(),
                t.getTitulo(),
                t.getCliente().getNome(),
                t.getDataAbertura(),
                t.getDataEncerramento(),
                t.getModulo().getNome()
        );
    }

    private void validarPeriodo(Integer mes, Integer ano) {
        if (mes == null || ano == null) {
            throw new RegraNegocioException("Parametros 'mes' e 'ano' sao obrigatorios");
        }
        if (mes < 1 || mes > 12) {
            throw new RegraNegocioException("Parametro 'mes' deve estar entre 1 e 12");
        }
        if (ano < ANO_MINIMO || ano > ANO_MAXIMO) {
            throw new RegraNegocioException("Parametro 'ano' deve estar entre " + ANO_MINIMO + " e " + ANO_MAXIMO);
        }
    }
}
