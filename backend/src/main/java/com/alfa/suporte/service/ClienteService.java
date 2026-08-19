package com.alfa.suporte.service;

import com.alfa.suporte.dto.ClienteDTO;
import com.alfa.suporte.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;

    @Transactional(readOnly = true)
    public List<ClienteDTO> listarTodos() {
        return clienteRepository.findAll().stream()
                .map(c -> new ClienteDTO(c.getId(), c.getNome()))
                .toList();
    }
}
