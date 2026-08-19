package com.alfa.suporte.controller;

import com.alfa.suporte.dto.CriarTicketRequest;
import com.alfa.suporte.dto.DashboardResponse;
import com.alfa.suporte.dto.TicketDTO;
import com.alfa.suporte.service.DashboardService;
import com.alfa.suporte.service.PermissaoService;
import com.alfa.suporte.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final DashboardService dashboardService;
    private final TicketService ticketService;
    private final PermissaoService permissaoService;

    @GetMapping("/dashboard")
    public DashboardResponse dashboard(Authentication authentication, @RequestParam Integer mes, @RequestParam Integer ano) {
        permissaoService.exigirVerDashboard(authentication.getName());
        return dashboardService.montarDashboard(mes, ano);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TicketDTO criar(Authentication authentication, @Valid @RequestBody CriarTicketRequest request) {
        permissaoService.exigirCriarChamado(authentication.getName());
        return ticketService.criar(request);
    }
}
