package com.furb.tcc.services;

import com.furb.tcc.entities.TipoAlerta;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificacaoService {

    private final FirebaseMessaging firebaseMessaging;

    public void enviar(String token, TipoAlerta tipo, String descricao) {
        if (token == null || token.isBlank()) return;

        Message message = Message.builder()
                .setToken(token)
                .setNotification(Notification.builder()
                        .setTitle(formatarTitulo(tipo))
                        .setBody(descricao)
                        .build())
                .putData("tipo", tipo.name())
                .build();

        try {
            firebaseMessaging.send(message);
        } catch (FirebaseMessagingException e) {
            throw new RuntimeException("Erro ao enviar notificação: " + e.getMessage());
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
