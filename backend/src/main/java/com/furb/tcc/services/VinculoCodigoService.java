package com.furb.tcc.services;

import com.furb.tcc.entities.CodigoVinculo;
import com.furb.tcc.entities.Cuidador;
import com.furb.tcc.entities.Idoso;
import com.furb.tcc.repositories.CodigoVinculoRepository;
import com.furb.tcc.repositories.CuidadorRepository;
import com.furb.tcc.repositories.IdosoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class VinculoCodigoService {

    private final CodigoVinculoRepository codigoRepository;
    private final IdosoRepository idosoRepository;
    private final CuidadorRepository cuidadorRepository;

    public String gerarCodigo(Long idosoId) {
        Idoso idoso = idosoRepository.findById(idosoId)
                .orElseThrow(() -> new RuntimeException("Idoso não encontrado"));

        // Remove códigos anteriores do idoso
        codigoRepository.deleteByIdosoId(idosoId);

        String codigo = String.format("%06d", new Random().nextInt(999999));

        CodigoVinculo codigoVinculo = CodigoVinculo.builder()
                .idoso(idoso)
                .codigo(codigo)
                .expiracao(LocalDateTime.now().plusMinutes(10))
                .usado(false)
                .build();

        codigoRepository.save(codigoVinculo);
        return codigo;
    }

    public void vincularPorCodigo(Long cuidadorId, String codigo) {
        CodigoVinculo codigoVinculo = codigoRepository.findByCodigoAndUsadoFalse(codigo)
                .orElseThrow(() -> new RuntimeException("Código inválido ou expirado"));

        if (LocalDateTime.now().isAfter(codigoVinculo.getExpiracao())) {
            throw new RuntimeException("Código expirado");
        }

        Cuidador cuidador = cuidadorRepository.findById(cuidadorId)
                .orElseThrow(() -> new RuntimeException("Cuidador não encontrado"));

        Idoso idoso = codigoVinculo.getIdoso();

        if (cuidador.getIdosos().contains(idoso)) {
            throw new RuntimeException("Vínculo já existe");
        }

        cuidador.getIdosos().add(idoso);
        cuidadorRepository.save(cuidador);

        codigoVinculo.setUsado(true);
        codigoRepository.save(codigoVinculo);
    }
}