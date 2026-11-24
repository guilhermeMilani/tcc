package com.furb.tcc.repositories;

import com.furb.tcc.entities.Alerta;
import com.furb.tcc.entities.TipoAlerta;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertaRepository extends JpaRepository<Alerta, Long> {
    List<Alerta> findByIdosoIdOrderByDataHoraDesc(Long idosoId);
    List<Alerta> findByIdosoIdAndLidoFalse(Long idosoId);
    List<Alerta> findByIdosoIdAndTipo(Long idosoId, TipoAlerta tipo);

    Page<Alerta> findByIdosoCuidadoresIdOrderByDataHoraDesc(Long cuidadorId, Pageable pageable);

    long countByLidoFalseAndIdosoCuidadoresId(Long cuidadorId);

    @Modifying
    @Query("update Alerta a set a.lido = true where a.lido = false and a.idoso.id in " +
            "(select i.id from Idoso i join i.cuidadores c where c.id = :cuidadorId)")
    int marcarTodosComoLidosDoCuidador(@Param("cuidadorId") Long cuidadorId);
}
