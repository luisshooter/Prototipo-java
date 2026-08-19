package com.alfa.suporte.exception;

/** Falha ou indisponibilidade de servico externo (ex.: forkify) -> mapeado para HTTP 502/503. */
public class ServicoExternoException extends RuntimeException {

    private final boolean timeout;

    public ServicoExternoException(String message, boolean timeout) {
        super(message);
        this.timeout = timeout;
    }

    public boolean isTimeout() {
        return timeout;
    }
}
