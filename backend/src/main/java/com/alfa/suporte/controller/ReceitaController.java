package com.alfa.suporte.controller;

import com.alfa.suporte.dto.ReceitaResponse;
import com.alfa.suporte.service.ReceitaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/receitas")
@RequiredArgsConstructor
public class ReceitaController {

    private final ReceitaService receitaService;

    @GetMapping
    public ReceitaResponse buscar(@RequestParam String prato) {
        return receitaService.buscar(prato);
    }
}
