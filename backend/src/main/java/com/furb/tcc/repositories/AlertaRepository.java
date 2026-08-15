package com.furb.tcc.repositories;

import com.furb.tcc.entities.Alerta;
import com.furb.tcc.entities.TipoAlerta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertaRepository extends JpaRepository<Alerta, Long> {
    List<Alerta> findByIdosoIdOrderByDataHoraDesc(Long idosoId);
    List<Alerta> findByIdosoIdAndLidoFalse(Long idosoId);
    List<Alerta> findByIdosoIdAndTipo(Long idosoId, TipoAlerta tipo);
}
