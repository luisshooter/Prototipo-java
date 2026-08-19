package com.alfa.suporte.exception;

/** Recurso referenciado nao existe -> mapeado para HTTP 404. */
public class RecursoNaoEncontradoException extends RuntimeException {

    public RecursoNaoEncontradoException(String message) {
        super(message);
    }
}
