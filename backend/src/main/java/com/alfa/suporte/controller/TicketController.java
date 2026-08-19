package com.alfa.suporte.controller;

import com.alfa.suporte.dto.CriarTicketRequest;
import com.alfa.suporte.dto.DashboardResponse;
import com.alfa.suporte.dto.TicketDTO;
import com.alfa.suporte.service.DashboardService;
import com.alfa.suporte.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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

    @GetMapping("/dashboard")
    public DashboardResponse dashboard(@RequestParam Integer mes, @RequestParam Integer ano) {
        return dashboardService.montarDashboard(mes, ano);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TicketDTO criar(@Valid @RequestBody CriarTicketRequest request) {
        return ticketService.criar(request);
    }
}
