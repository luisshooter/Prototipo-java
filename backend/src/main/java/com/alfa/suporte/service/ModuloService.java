package com.alfa.suporte.service;

import com.alfa.suporte.dto.ModuloDTO;
import com.alfa.suporte.repository.ModuloRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ModuloService {

    private final ModuloRepository moduloRepository;

    @Transactional(readOnly = true)
    public List<ModuloDTO> listarTodos() {
        return moduloRepository.findAll().stream()
                .map(m -> new ModuloDTO(m.getId(), m.getNome()))
                .toList();
    }
}
