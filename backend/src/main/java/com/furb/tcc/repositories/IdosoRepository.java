package com.furb.tcc.repositories;

import com.furb.tcc.entities.Idoso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IdosoRepository extends JpaRepository<Idoso, Long> {
    Optional<Idoso> findByEmail(String email);
    List<Idoso> findByCuidadoresId(Long cuidadorId);
}
