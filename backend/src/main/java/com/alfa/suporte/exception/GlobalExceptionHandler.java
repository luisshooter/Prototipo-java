package com.alfa.suporte.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.List;

/**
 * Handler global unico de excecoes. Nenhum controlador trata excecao individualmente:
 * todo erro converge para um corpo padronizado, sem vazar stack trace ao cliente.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RegraNegocioException.class)
    public ResponseEntity<ApiErrorResponse> handleRegraNegocio(RegraNegocioException ex, HttpServletRequest req) {
        return corpo(HttpStatus.BAD_REQUEST, ex.getMessage(), req, List.of());
    }

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<ApiErrorResponse> handleNaoEncontrado(RecursoNaoEncontradoException ex, HttpServletRequest req) {
        return corpo(HttpStatus.NOT_FOUND, ex.getMessage(), req, List.of());
    }

    @ExceptionHandler(CredencialInvalidaException.class)
    public ResponseEntity<ApiErrorResponse> handleCredencialInvalida(CredencialInvalidaException ex, HttpServletRequest req) {
        return corpo(HttpStatus.UNAUTHORIZED, ex.getMessage(), req, List.of());
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiErrorResponse> handleBadCredentials(HttpServletRequest req) {
        return corpo(HttpStatus.UNAUTHORIZED, "E-mail ou senha invalidos", req, List.of());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleAccessDenied(HttpServletRequest req) {
        return corpo(HttpStatus.FORBIDDEN, "Voce nao tem permissao para executar esta acao", req, List.of());
    }

    @ExceptionHandler(ServicoExternoException.class)
    public ResponseEntity<ApiErrorResponse> handleServicoExterno(ServicoExternoException ex, HttpServletRequest req) {
        HttpStatus status = ex.isTimeout() ? HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.BAD_GATEWAY;
        return corpo(status, ex.getMessage(), req, List.of());
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiErrorResponse> handleParametroAusente(MissingServletRequestParameterException ex, HttpServletRequest req) {
        return corpo(HttpStatus.BAD_REQUEST, "Parametro obrigatorio ausente: " + ex.getParameterName(), req, List.of());
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiErrorResponse> handleTipoInvalido(MethodArgumentTypeMismatchException ex, HttpServletRequest req) {
        return corpo(HttpStatus.BAD_REQUEST, "Parametro '" + ex.getName() + "' com valor invalido", req, List.of());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidacao(MethodArgumentNotValidException ex, HttpServletRequest req) {
        List<String> detalhes = ex.getBindingResult().getFieldErrors().stream()
                .map(f -> f.getField() + ": " + f.getDefaultMessage())
                .toList();
        return corpo(HttpStatus.BAD_REQUEST, "Dados invalidos", req, detalhes);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGenerico(Exception ex, HttpServletRequest req) {
        return corpo(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno inesperado", req, List.of());
    }

    private ResponseEntity<ApiErrorResponse> corpo(HttpStatus status, String message, HttpServletRequest req, List<String> detalhes) {
        ApiErrorResponse body = new ApiErrorResponse(
                status.value(), status.getReasonPhrase(), message, req.getRequestURI(), detalhes);
        return ResponseEntity.status(status).body(body);
    }
}
