package com.furb.tcc.repositories;

import com.furb.tcc.entities.CodigoVinculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CodigoVinculoRepository extends JpaRepository<CodigoVinculo, Long> {
    Optional<CodigoVinculo> findByCodigoAndUsadoFalse(String codigo);
    void deleteByIdosoId(Long idosoId);
}