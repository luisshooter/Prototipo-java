package com.alfa.suporte.service;

import com.alfa.suporte.dto.AgrupamentoDTO;
import com.alfa.suporte.dto.DashboardResponse;
import com.alfa.suporte.entity.Cliente;
import com.alfa.suporte.entity.Modulo;
import com.alfa.suporte.entity.Ticket;
import com.alfa.suporte.exception.RegraNegocioException;
import com.alfa.suporte.repository.TicketRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Cobre a regra critica do bloco 01: o agrupamento por cliente e por modulo
 * precisa ser calculado em memoria (Streams), a partir da lista de tickets
 * do periodo - nunca via agregacao SQL.
 */
@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    private DashboardService dashboardService;

    private Cliente apple;
    private Cliente google;
    private Modulo financeiro;
    private Modulo vendas;

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        dashboardService = new DashboardService(ticketRepository);

        apple = new Cliente(1L, "Apple Inc.");
        google = new Cliente(2L, "Google");
        financeiro = new Modulo(1L, "Financeiro");
        vendas = new Modulo(2L, "Vendas");
    }

    @Test
    void deveAgruparTicketsPorClienteEModuloEmMemoria() {
        List<Ticket> tickets = List.of(
                ticket(apple, financeiro, "2021-03-01"),
                ticket(apple, vendas, "2021-03-02"),
                ticket(google, financeiro, "2021-03-03")
        );
        when(ticketRepository.buscarPorPeriodoAbertura(any(), any())).thenReturn(tickets);

        DashboardResponse resposta = dashboardService.montarDashboard(3, 2021);

        assertThat(resposta.tickets()).hasSize(3);
        assertThat(resposta.porCliente()).containsExactlyInAnyOrder(
                new AgrupamentoDTO("Apple Inc.", 2),
                new AgrupamentoDTO("Google", 1)
        );
        assertThat(resposta.porModulo()).containsExactlyInAnyOrder(
                new AgrupamentoDTO("Financeiro", 2),
                new AgrupamentoDTO("Vendas", 1)
        );
    }

    @Test
    void devoRetornarListasVaziasQuandoPeriodoSemChamados() {
        when(ticketRepository.buscarPorPeriodoAbertura(any(), any())).thenReturn(List.of());

        DashboardResponse resposta = dashboardService.montarDashboard(1, 2021);

        assertThat(resposta.tickets()).isEmpty();
        assertThat(resposta.porCliente()).isEmpty();
        assertThat(resposta.porModulo()).isEmpty();
    }

    @Test
    void deveRejeitarMesForaDaFaixa() {
        assertThatThrownBy(() -> dashboardService.montarDashboard(13, 2021))
                .isInstanceOf(RegraNegocioException.class);
    }

    @Test
    void deveRejeitarParametrosAusentes() {
        assertThatThrownBy(() -> dashboardService.montarDashboard(null, 2021))
                .isInstanceOf(RegraNegocioException.class);
        assertThatThrownBy(() -> dashboardService.montarDashboard(3, null))
                .isInstanceOf(RegraNegocioException.class);
    }

    private Ticket ticket(Cliente cliente, Modulo modulo, String dataAbertura) {
        Ticket ticket = new Ticket();
        ticket.setTitulo("Chamado de teste");
        ticket.setCliente(cliente);
        ticket.setModulo(modulo);
        ticket.setDataAbertura(LocalDate.parse(dataAbertura));
        return ticket;
    }
}
