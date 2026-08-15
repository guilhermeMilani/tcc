package com.furb.tcc.smartwatchsimulator;

import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.Map;

@Component
public class SimuladorConfig {

    public FaixaValores getFaixa(EstadoAtividade estado) {
        return switch (estado) {
            case REPOUSO           -> new FaixaValores(60, 75,  97, 99,  36.0, 36.8);
            case CAMINHANDO        -> new FaixaValores(85, 105, 96, 98,  36.5, 37.2);
            case EXERCICIO         -> new FaixaValores(110, 145, 95, 97, 37.0, 37.8);
            case DORMINDO          -> new FaixaValores(50, 65,  96, 99,  35.8, 36.5);
            case ANOMALIA_CARDIACA -> new FaixaValores(150, 180, 95, 98, 36.0, 36.8);
            case ANOMALIA_SPO2     -> new FaixaValores(85, 100, 85, 91,  36.0, 36.8);
            case FEBRE             -> new FaixaValores(90, 110, 95, 97,  37.9, 39.5);
        };
    }

    public Map<EstadoAtividade, Map<EstadoAtividade, Double>> getTransicoes() {
        Map<EstadoAtividade, Map<EstadoAtividade, Double>> transicoes = new EnumMap<>(EstadoAtividade.class);

        transicoes.put(EstadoAtividade.REPOUSO, Map.of(
                EstadoAtividade.REPOUSO,           0.70,
                EstadoAtividade.CAMINHANDO,        0.15,
                EstadoAtividade.DORMINDO,          0.08,
                EstadoAtividade.ANOMALIA_CARDIACA, 0.02,
                EstadoAtividade.ANOMALIA_SPO2,     0.02,
                EstadoAtividade.FEBRE,             0.03
        ));

        transicoes.put(EstadoAtividade.CAMINHANDO, Map.of(
                EstadoAtividade.CAMINHANDO,        0.60,
                EstadoAtividade.REPOUSO,           0.20,
                EstadoAtividade.EXERCICIO,         0.15,
                EstadoAtividade.ANOMALIA_CARDIACA, 0.03,
                EstadoAtividade.ANOMALIA_SPO2,     0.02
        ));

        transicoes.put(EstadoAtividade.EXERCICIO, Map.of(
                EstadoAtividade.EXERCICIO,         0.55,
                EstadoAtividade.CAMINHANDO,        0.35,
                EstadoAtividade.ANOMALIA_CARDIACA, 0.05,
                EstadoAtividade.ANOMALIA_SPO2,     0.05
        ));

        transicoes.put(EstadoAtividade.DORMINDO, Map.of(
                EstadoAtividade.DORMINDO,          0.85,
                EstadoAtividade.REPOUSO,           0.13,
                EstadoAtividade.ANOMALIA_SPO2,     0.02
        ));

        transicoes.put(EstadoAtividade.ANOMALIA_CARDIACA, Map.of(
                EstadoAtividade.ANOMALIA_CARDIACA, 0.40,
                EstadoAtividade.REPOUSO,           0.60
        ));

        transicoes.put(EstadoAtividade.ANOMALIA_SPO2, Map.of(
                EstadoAtividade.ANOMALIA_SPO2,     0.40,
                EstadoAtividade.REPOUSO,           0.60
        ));

        transicoes.put(EstadoAtividade.FEBRE, Map.of(
                EstadoAtividade.FEBRE,             0.70,
                EstadoAtividade.REPOUSO,           0.30
        ));

        return transicoes;
    }
}
