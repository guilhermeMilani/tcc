package com.furb.tcc.repositories;

import com.furb.tcc.entities.RegistroMedicacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RegistroMedicacaoRepository extends JpaRepository<RegistroMedicacao, Long> {
    List<RegistroMedicacao> findByMedicacaoId(Long medicacaoId);
    List<RegistroMedicacao> findByMedicacaoIdosoIdAndDataHoraBetween(
            Long idosoId,
            LocalDateTime inicio,
            LocalDateTime fim
    );
}
