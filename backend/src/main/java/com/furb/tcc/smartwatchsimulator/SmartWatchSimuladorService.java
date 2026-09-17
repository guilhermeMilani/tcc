package com.furb.tcc.smartwatchsimulator;

import com.furb.tcc.dtos.requests.LocalizacaoRequest;
import com.furb.tcc.dtos.requests.SinalVitalRequest;
import com.furb.tcc.entities.Idoso;
import com.furb.tcc.repositories.IdosoRepository;
import com.furb.tcc.services.LocalizacaoService;
import com.furb.tcc.services.SinalVitalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmartWatchSimuladorService {

    private final IdosoRepository idosoRepository;
    private final SinalVitalService sinalVitalService;
    private final LocalizacaoService localizacaoService;
    private final SimuladorConfig config;

    private final Map<Long, EstadoSimulacao> estadosPorIdoso = new ConcurrentHashMap<>();
    private final Random random = new Random();

    private final Map<Long, double[]> localizacaoBase = new ConcurrentHashMap<>();

    @Scheduled(fixedRate = 60000)
    public void simularSinaisVitais() {
        List<Idoso> idosos = idosoRepository.findAll();

        if (idosos.isEmpty()) return;

        for (Idoso idoso : idosos) {
            EstadoSimulacao estado = estadosPorIdoso.computeIfAbsent(
                    idoso.getId(), id -> inicializarEstado()
            );

            atualizarEstado(idoso.getId(), estado);
            gerarSinalVital(idoso, estado);
        }
    }

    @Scheduled(fixedRate = 15000)
    public void simularLocalizacao() {
        List<Idoso> idosos = idosoRepository.findAll();

        if (idosos.isEmpty()) return;

        for (Idoso idoso : idosos) {
            gerarLocalizacao(idoso);
        }
    }

    private EstadoSimulacao inicializarEstado() {
        FaixaValores faixa = config.getFaixa(EstadoAtividade.REPOUSO);
        return new EstadoSimulacao(
                EstadoAtividade.REPOUSO,
                meio(faixa.getFreqMin(), faixa.getFreqMax()),
                meio(faixa.getSpO2Min(), faixa.getSpO2Max()),
                meio(faixa.getTempMin(), faixa.getTempMax())
        );
    }

    private void atualizarEstado(Long idosoId, EstadoSimulacao estado) {
        Map<EstadoAtividade, Double> transicoes = config.getTransicoes().get(estado.getEstado());
        EstadoAtividade novoEstado = sortearEstado(transicoes);

        if (novoEstado != estado.getEstado()) {
            log.info("Idoso {}: transição {} -> {}", idosoId, estado.getEstado(), novoEstado);
            estado.setEstado(novoEstado);
        }
    }

    private void gerarSinalVital(Idoso idoso, EstadoSimulacao estado) {
        FaixaValores faixa = config.getFaixa(estado.getEstado());

        double novaFreq = variacaoSuave(estado.getFrequenciaAtual(), faixa.getFreqMin(), faixa.getFreqMax(), 3.0);
        double novaSpO2 = variacaoSuave(estado.getSpO2Atual(), faixa.getSpO2Min(), faixa.getSpO2Max(), 0.5);
        double novaTemp = variacaoSuave(estado.getTemperaturaAtual(), faixa.getTempMin(), faixa.getTempMax(), 0.1);

        estado.setFrequenciaAtual(novaFreq);
        estado.setSpO2Atual(novaSpO2);
        estado.setTemperaturaAtual(novaTemp);

        SinalVitalRequest request = new SinalVitalRequest(
                idoso.getId(),
                (int) Math.round(novaFreq),
                arredondar(novaSpO2),
                arredondar(novaTemp)
        );

        sinalVitalService.registrar(request);
        log.debug("Idoso {} [{}] — FC: {}, SpO2: {}, Temp: {}",
                idoso.getId(), estado.getEstado(),
                request.getFrequenciaCardiaca(), request.getSpO2(), request.getTemperatura());
    }

    private void gerarLocalizacao(Idoso idoso) {
        double[] base = localizacaoBase.computeIfAbsent(
                idoso.getId(), id -> new double[]{-23.5505, -46.6333}
        );

        EstadoSimulacao estado = estadosPorIdoso.get(idoso.getId());
        EstadoAtividade atividade = estado != null ? estado.getEstado() : EstadoAtividade.REPOUSO;

        double delta = switch (atividade) {
            case DORMINDO, REPOUSO -> 0.0001;  // quase parado
            case CAMINHANDO        -> 0.0005;  // movimento leve
            case EXERCICIO         -> 0.001;   // movimento moderado
            default                -> 0.0002;
        };

        base[0] += (random.nextDouble() - 0.5) * delta;
        base[1] += (random.nextDouble() - 0.5) * delta;

        LocalizacaoRequest request = new LocalizacaoRequest(idoso.getId(), base[0], base[1]);
        localizacaoService.registrar(request);
    }

    private double variacaoSuave(double valorAtual, double min, double max, double deltaMax) {
        double variacao = (random.nextDouble() - 0.5) * 2 * deltaMax;
        double novoValor = valorAtual + variacao;
        return Math.max(min, Math.min(max, novoValor));
    }

    private EstadoAtividade sortearEstado(Map<EstadoAtividade, Double> transicoes) {
        double sorteio = random.nextDouble();
        double acumulado = 0.0;

        for (Map.Entry<EstadoAtividade, Double> entry : transicoes.entrySet()) {
            acumulado += entry.getValue();
            if (sorteio <= acumulado) return entry.getKey();
        }

        return transicoes.keySet().iterator().next();
    }

    private double meio(double min, double max) {
        return (min + max) / 2.0;
    }

    private double arredondar(double valor) {
        return Math.round(valor * 10.0) / 10.0;
    }
}
