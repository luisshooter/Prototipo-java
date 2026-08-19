package com.alfa.suporte.controller;

import com.alfa.suporte.dto.ModuloDTO;
import com.alfa.suporte.service.ModuloService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/modulos")
@RequiredArgsConstructor
public class ModuloController {

    private final ModuloService moduloService;

    @GetMapping
    public List<ModuloDTO> listar() {
        return moduloService.listarTodos();
    }
}
