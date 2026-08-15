package com.furb.tcc.services;

import com.furb.tcc.dtos.requests.SinalVitalRequest;
import com.furb.tcc.entities.Idoso;
import com.furb.tcc.entities.SinalVital;
import com.furb.tcc.repositories.IdosoRepository;
import com.furb.tcc.repositories.SinalVitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SinalVitalService {

    private final SinalVitalRepository sinalVitalRepository;
    private final IdosoRepository idosoRepository;
    private final AlertaService alertaService;

    public void registrar(SinalVitalRequest request) {
        Idoso idoso = idosoRepository.findById(request.getIdosoId())
                .orElseThrow(() -> new RuntimeException("Idoso não encontrado"));

        SinalVital sinalVital = SinalVital.builder()
                .idosoId(String.valueOf(idoso.getId()))
                .frequenciaCardiaca(request.getFrequenciaCardiaca())
                .spO2(request.getSpO2())
                .temperatura(request.getTemperatura())
                .dataHora(Instant.now())
                .build();

        sinalVitalRepository.salvar(sinalVital);
        alertaService.verificarAnomalias(idoso, sinalVital);
    }

    public List<SinalVital> buscarHistorico(Long idosoId, String range) {
        return sinalVitalRepository.buscarPorIdoso(String.valueOf(idosoId), range);
    }
}
