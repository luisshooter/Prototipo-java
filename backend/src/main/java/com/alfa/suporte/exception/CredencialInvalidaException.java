package com.alfa.suporte.exception;

/** Login/refresh/token invalido -> mapeado para HTTP 401. */
public class CredencialInvalidaException extends RuntimeException {

    public CredencialInvalidaException(String message) {
        super(message);
    }
}
