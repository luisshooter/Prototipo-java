package com.alfa.suporte.service;

import com.alfa.suporte.client.ForkifyClient;
import com.alfa.suporte.client.ForkifyRecipeRaw;
import com.alfa.suporte.client.ForkifySearchResponseRaw;
import com.alfa.suporte.dto.ReceitaDTO;
import com.alfa.suporte.dto.ReceitaResponse;
import com.alfa.suporte.exception.RegraNegocioException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReceitaService {

    private final ForkifyClient forkifyClient;

    public ReceitaResponse buscar(String prato) {
        if (prato == null || prato.isBlank()) {
            throw new RegraNegocioException("Parametro 'prato' e obrigatorio");
        }

        ForkifySearchResponseRaw resultado = forkifyClient.buscarReceitas(prato.trim());

        List<ReceitaDTO> receitas = resultado.recipes() == null
                ? List.of()
                : resultado.recipes().stream().map(this::paraDTO).toList();

        return new ReceitaResponse(resultado.count(), receitas);
    }

    private ReceitaDTO paraDTO(ForkifyRecipeRaw raw) {
        return new ReceitaDTO(
                raw.publisher(),
                raw.title(),
                raw.sourceUrl(),
                raw.recipeId(),
                raw.imageUrl(),
                raw.socialRank(),
                raw.publisherUrl()
        );
    }
}
