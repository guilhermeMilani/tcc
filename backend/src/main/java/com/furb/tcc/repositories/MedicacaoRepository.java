package com.furb.tcc.repositories;

import com.furb.tcc.entities.Medicacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MedicacaoRepository extends JpaRepository<Medicacao, Long> {
    List<Medicacao> findByIdosoId(Long idosoId);
}
