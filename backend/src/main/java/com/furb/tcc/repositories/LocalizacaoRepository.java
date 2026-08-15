package com.furb.tcc.repositories;

import com.furb.tcc.entities.Localizacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface LocalizacaoRepository extends JpaRepository<Localizacao, Long> {
    Optional<Localizacao> findTopByIdosoIdOrderByDataHoraDesc(Long idosoId);
    List<Localizacao> findByIdosoIdAndDataHoraBetween(
            Long idosoId,
            LocalDateTime inicio,
            LocalDateTime fim
    );
}