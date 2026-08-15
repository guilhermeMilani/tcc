package com.furb.tcc.repositories;

import com.furb.tcc.entities.Cuidador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CuidadorRepository extends JpaRepository<Cuidador, Long> {
    Optional<Cuidador> findByEmail(String email);
    List<Cuidador> findByIdososId(Long idosoId);
}
