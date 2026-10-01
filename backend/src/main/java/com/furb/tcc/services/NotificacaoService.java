package com.furb.tcc.services;

import com.furb.tcc.entities.TipoAlerta;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;


import java.util.HashMap;
import java.util.Map;

@Service
public class NotificacaoService {

    private final RestTemplate restTemplate = new RestTemplate();

    public void enviar(String token, TipoAlerta tipo, String descricao) {
        if (token == null || token.isBlank()) return;

        Map<String, Object> body = new HashMap<>();
        body.put("to", token);
        body.put("title", formatarTitulo(tipo));
        body.put("body", descricao);
        body.put("sound", "default");
        body.put("priority", "high");
        body.put("data", Map.of("tipo", tipo.name()));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Accept", "application/json");

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            restTemplate.postForEntity(
                    "https://exp.host/--/api/v2/push/send",
                    request,
                    String.class
            );
        } catch (Exception e) {
            System.err.println("Erro ao enviar notificação: " + e.getMessage());
        }
    }

    private String formatarTitulo(TipoAlerta tipo) {
        return switch (tipo) {
            case FREQUENCIA_ALTA -> "⚠️ Frequência Cardíaca Alta";
            case FREQUENCIA_BAIXA -> "⚠️ Frequência Cardíaca Baixa";
            case SPO2_BAIXO -> "⚠️ SpO2 Abaixo do Normal";
            case TEMPERATURA_ALTA -> "⚠️ Temperatura Elevada";
            case PANICO -> "🚨 Emergência — Botão de Pânico";
        };
    }
}
