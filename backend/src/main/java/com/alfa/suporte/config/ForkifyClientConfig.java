package com.alfa.suporte.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.ClientHttpRequestFactories;
import org.springframework.boot.web.client.ClientHttpRequestFactorySettings;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

/** A chamada HTTP externa tem timeout explicito para nao bloquear a API indefinidamente. */
@Configuration
public class ForkifyClientConfig {

    @Bean
    public RestClient forkifyRestClient(@Value("${app.forkify.timeout-ms}") long timeoutMs) {
        ClientHttpRequestFactorySettings settings = ClientHttpRequestFactorySettings.DEFAULTS
                .withConnectTimeout(Duration.ofMillis(timeoutMs))
                .withReadTimeout(Duration.ofMillis(timeoutMs));
        ClientHttpRequestFactory factory = ClientHttpRequestFactories.get(settings);
        return RestClient.builder().requestFactory(factory).build();
    }
}
