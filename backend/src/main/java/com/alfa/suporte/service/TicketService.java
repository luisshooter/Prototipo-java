package com.alfa.suporte.service;

import com.alfa.suporte.dto.CriarTicketRequest;
import com.alfa.suporte.dto.TicketDTO;
import com.alfa.suporte.entity.Cliente;
import com.alfa.suporte.entity.Modulo;
import com.alfa.suporte.entity.Ticket;
import com.alfa.suporte.exception.RecursoNaoEncontradoException;
import com.alfa.suporte.exception.RegraNegocioException;
import com.alfa.suporte.repository.ClienteRepository;
import com.alfa.suporte.repository.ModuloRepository;
import com.alfa.suporte.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final ClienteRepository clienteRepository;
    private final ModuloRepository moduloRepository;

    @Transactional
    public TicketDTO criar(CriarTicketRequest request) {
        Cliente cliente = clienteRepository.findById(request.codCliente())
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Cliente %d nao encontrado".formatted(request.codCliente())));

        Modulo modulo = moduloRepository.findById(request.codModulo())
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Modulo %d nao encontrado".formatted(request.codModulo())));

        if (request.dataEncerramento() != null && request.dataEncerramento().isBefore(request.dataAbertura())) {
            throw new RegraNegocioException("Data de encerramento nao pode ser anterior a data de abertura");
        }

        Ticket ticket = new Ticket();
        ticket.setTitulo(request.titulo());
        ticket.setCliente(cliente);
        ticket.setModulo(modulo);
        ticket.setDataAbertura(request.dataAbertura());
        ticket.setDataEncerramento(request.dataEncerramento());

        Ticket salvo = ticketRepository.save(ticket);

        return new TicketDTO(
                salvo.getId(),
                salvo.getTitulo(),
                cliente.getNome(),
                salvo.getDataAbertura(),
                salvo.getDataEncerramento(),
                modulo.getNome()
        );
    }
}
