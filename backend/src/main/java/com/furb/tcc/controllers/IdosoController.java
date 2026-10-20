package com.furb.tcc.controllers;

import com.furb.tcc.entities.Idoso;
import com.furb.tcc.repositories.IdosoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/idosos")
@RequiredArgsConstructor
public class IdosoController {

    private final IdosoRepository idosoRepository;

    @PutMapping("/{id}/token")
    public ResponseEntity<Void> atualizarToken(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        Idoso idoso = idosoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Idoso não encontrado"));

        idoso.setTokenNotificacao(body.get("token"));
        idosoRepository.save(idoso);
        return ResponseEntity.ok().build();
    }
}