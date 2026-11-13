package com.furb.tcc.controllers;

import com.furb.tcc.services.TokenNotificacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/cuidadores")
@RequiredArgsConstructor
public class CuidadorController {

    private final TokenNotificacaoService tokenService;

    @PutMapping("/{id}/token")
    public ResponseEntity<Void> atualizarToken(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        tokenService.registrarParaCuidador(id, body.get("token"));
        return ResponseEntity.ok().build();
    }
}