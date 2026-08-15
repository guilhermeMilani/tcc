package com.furb.tcc.services;

import com.furb.tcc.dtos.requests.LocalizacaoRequest;
import com.furb.tcc.entities.Idoso;
import com.furb.tcc.entities.Localizacao;
import com.furb.tcc.repositories.IdosoRepository;
import com.furb.tcc.repositories.LocalizacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class LocalizacaoService {

    private final LocalizacaoRepository localizacaoRepository;
    private final IdosoRepository idosoRepository;
    private final AlertaService alertaService;

    public void registrar(LocalizacaoRequest request) {
        Idoso idoso = idosoRepository.findById(request.getIdosoId())
                .orElseThrow(() -> new RuntimeException("Idoso não encontrado"));

        Localizacao localizacao = Localizacao.builder()
                .idoso(idoso)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .dataHora(LocalDateTime.now())
                .build();

        localizacaoRepository.save(localizacao);
    }

    public void registrarPanico(LocalizacaoRequest request) {
        registrar(request);

        Idoso idoso = idosoRepository.findById(request.getIdosoId())
                .orElseThrow(() -> new RuntimeException("Idoso não encontrado"));

        alertaService.acionarPanico(idoso);
    }

    public Localizacao buscarUltimaLocalizacao(Long idosoId) {
        return localizacaoRepository.findTopByIdosoIdOrderByDataHoraDesc(idosoId)
                .orElseThrow(() -> new RuntimeException("Nenhuma localização encontrada"));
    }
}