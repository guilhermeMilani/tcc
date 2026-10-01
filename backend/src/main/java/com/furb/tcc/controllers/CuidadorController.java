package com.furb.tcc.controllers;

import com.furb.tcc.entities.Cuidador;
import com.furb.tcc.repositories.CuidadorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/cuidadores")
@RequiredArgsConstructor
public class CuidadorController {

    private final CuidadorRepository cuidadorRepository;

    @PutMapping("/{id}/token")
    public ResponseEntity<Void> atualizarToken(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        Cuidador cuidador = cuidadorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cuidador não encontrado"));

        cuidador.setTokenNotificacao(body.get("token"));
        cuidadorRepository.save(cuidador);
        return ResponseEntity.ok().build();
    }
}