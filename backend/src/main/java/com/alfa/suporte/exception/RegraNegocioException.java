package com.alfa.suporte.exception;

/** Erro de validacao/regra de negocio -> mapeado para HTTP 400. */
public class RegraNegocioException extends RuntimeException {

    public RegraNegocioException(String message) {
        super(message);
    }
}
