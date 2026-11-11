package com.furb.tcc.services;

import com.furb.tcc.entities.TipoAlerta;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class NotificacaoService {

    private static final String EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
    private static final String CANAL_ANDROID = "alertas-criticos";

    private final RestTemplate restTemplate = new RestTemplate();

    public void enviar(String token, TipoAlerta tipo, String descricao) {
        if (token == null || token.isBlank()) return;

        enviarParaExpo(token, formatarTitulo(tipo), descricao, tipo.name());
    }

    public void enviarLembrete(String token, String nomeMed, String dosagem, String horario) {
        if (token == null || token.isBlank()) return;

        String corpo = String.format("%s - %s às %s", nomeMed, dosagem, horario);
        enviarParaExpo(token, "💊 Hora do medicamento!", corpo, "LEMBRETE_MEDICACAO");
    }

    private void enviarParaExpo(String token, String titulo, String corpo, String tipo) {
        Map<String, Object> body = new HashMap<>();
        body.put("to", token);
        body.put("title", titulo);
        body.put("body", corpo);
        body.put("sound", "default");
        body.put("priority", "high");
        body.put("channelId", CANAL_ANDROID);
        body.put("data", Map.of("tipo", tipo));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Accept", "application/json");

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> resposta = restTemplate.postForEntity(
                    EXPO_PUSH_URL,
                    request,
                    String.class
            );
            System.out.println("Resposta Expo Push (" + tipo + "): " + resposta.getBody());
        } catch (Exception e) {
            System.err.println("Erro ao enviar notificação (" + tipo + "): " + e.getMessage());
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