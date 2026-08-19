package com.alfa.suporte.client;

import com.alfa.suporte.exception.ServicoExternoException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;

@Component
public class ForkifyClientImpl implements ForkifyClient {

    private final RestClient restClient;
    private final String baseUrl;

    public ForkifyClientImpl(RestClient forkifyRestClient,
                              @Value("${app.forkify.base-url}") String baseUrl) {
        this.restClient = forkifyRestClient;
        this.baseUrl = baseUrl;
    }

    @Override
    public ForkifySearchResponseRaw buscarReceitas(String prato) {
        try {
            return restClient.get()
                    .uri(baseUrl + "?q={prato}", prato)
                    .retrieve()
                    .body(ForkifySearchResponseRaw.class);
        } catch (ResourceAccessException e) {
            // timeout ou falha de conexao - servico externo indisponivel
            throw new ServicoExternoException("Servico de receitas indisponivel no momento. Tente novamente em instantes.", true);
        } catch (HttpClientErrorException e) {
            // a forkify-api responde 4xx (ex.: 400 "Couldn't find recipe with that name")
            // quando a busca nao encontra nada - isso e "sem resultados", nao falha do servico.
            return new ForkifySearchResponseRaw(0, List.of());
        } catch (HttpServerErrorException e) {
            throw new ServicoExternoException("Servico de receitas retornou erro interno. Tente novamente em instantes.", false);
        } catch (RestClientException e) {
            throw new ServicoExternoException("Nao foi possivel completar a consulta ao servico de receitas.", false);
        }
    }
}
