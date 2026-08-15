package com.furb.tcc.services;

import com.furb.tcc.entities.*;
import com.furb.tcc.repositories.AlertaRepository;
import com.furb.tcc.repositories.CuidadorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertaService {

    private final AlertaRepository alertaRepository;
    private final CuidadorRepository cuidadorRepository;
    private final NotificacaoService notificacaoService;

    public void verificarAnomalias(Idoso idoso, SinalVital sinalVital) {
        if (sinalVital.getFrequenciaCardiaca() > idoso.getLimiteFreqMax()) {
            gerarAlerta(idoso, TipoAlerta.FREQUENCIA_ALTA,
                    "Frequência cardíaca elevada: " + sinalVital.getFrequenciaCardiaca() + " bpm");
        }

        if (sinalVital.getFrequenciaCardiaca() < idoso.getLimiteFreqMin()) {
            gerarAlerta(idoso, TipoAlerta.FREQUENCIA_BAIXA,
                    "Frequência cardíaca baixa: " + sinalVital.getFrequenciaCardiaca() + " bpm");
        }

        if (sinalVital.getSpO2() < idoso.getLimiteSpO2Min()) {
            gerarAlerta(idoso, TipoAlerta.SPO2_BAIXO,
                    "SpO2 abaixo do limite: " + sinalVital.getSpO2() + "%");
        }

        if (sinalVital.getTemperatura() > idoso.getLimiteTempMax()) {
            gerarAlerta(idoso, TipoAlerta.TEMPERATURA_ALTA,
                    "Temperatura elevada: " + sinalVital.getTemperatura() + "°C");
        }
    }

    public void acionarPanico(Idoso idoso) {
        gerarAlerta(idoso, TipoAlerta.PANICO, "Botão de pânico acionado pelo idoso");
    }

    public List<Alerta> listarPorIdoso(Long idosoId) {
        return alertaRepository.findByIdosoIdOrderByDataHoraDesc(idosoId);
    }

    public void marcarComoLido(Long alertaId) {
        Alerta alerta = alertaRepository.findById(alertaId)
                .orElseThrow(() -> new RuntimeException("Alerta não encontrado"));
        alerta.setLido(true);
        alertaRepository.save(alerta);
    }

    private void gerarAlerta(Idoso idoso, TipoAlerta tipo, String descricao) {
        Alerta alerta = Alerta.builder()
                .idoso(idoso)
                .tipo(tipo)
                .descricao(descricao)
                .dataHora(LocalDateTime.now())
                .lido(false)
                .build();

        alertaRepository.save(alerta);

        List<Cuidador> cuidadores = cuidadorRepository.findByIdososId(idoso.getId());
        cuidadores.forEach(c -> notificacaoService.enviar(c.getTokenNotificacao(), tipo, descricao));
    }
}
