package com.alfa.suporte.client;

/** Isola o acesso ao servico externo forkify, desacoplado do controlador. */
public interface ForkifyClient {

    ForkifySearchResponseRaw buscarReceitas(String prato);
}
