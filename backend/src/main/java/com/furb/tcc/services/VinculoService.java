package com.furb.tcc.services;

import com.furb.tcc.entities.Cuidador;
import com.furb.tcc.entities.Idoso;
import com.furb.tcc.repositories.CuidadorRepository;
import com.furb.tcc.repositories.IdosoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VinculoService {

    private final IdosoRepository idosoRepository;
    private final CuidadorRepository cuidadorRepository;

    public void vincular(Long cuidadorId, Long idosoId) {
        Cuidador cuidador = cuidadorRepository.findById(cuidadorId)
                .orElseThrow(() -> new RuntimeException("Cuidador não encontrado"));

        Idoso idoso = idosoRepository.findById(idosoId)
                .orElseThrow(() -> new RuntimeException("Idoso não encontrado"));

        if (cuidador.getIdosos().contains(idoso)) {
            throw new RuntimeException("Vínculo já existe");
        }

        cuidador.getIdosos().add(idoso);
        cuidadorRepository.save(cuidador);
    }

    public void desvincular(Long cuidadorId, Long idosoId) {
        Cuidador cuidador = cuidadorRepository.findById(cuidadorId)
                .orElseThrow(() -> new RuntimeException("Cuidador não encontrado"));

        Idoso idoso = idosoRepository.findById(idosoId)
                .orElseThrow(() -> new RuntimeException("Idoso não encontrado"));

        cuidador.getIdosos().remove(idoso);
        cuidadorRepository.save(cuidador);
    }

    public List<Idoso> listarIdososDoCuidador(Long cuidadorId) {
        return idosoRepository.findByCuidadoresId(cuidadorId);
    }

    public List<Cuidador> listarCuidadoresDoIdoso(Long idosoId) {
        return cuidadorRepository.findByIdososId(idosoId);
    }
}
