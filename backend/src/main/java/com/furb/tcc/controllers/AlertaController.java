package com.furb.tcc.controllers;

import com.furb.tcc.entities.Alerta;
import com.furb.tcc.services.AlertaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/alertas")
@RequiredArgsConstructor
public class AlertaController {

    private final AlertaService alertaService;

    @GetMapping("/idoso/{idosoId}")
    public ResponseEntity<List<Alerta>> listarPorIdoso(@PathVariable Long idosoId) {
        return ResponseEntity.ok(alertaService.listarPorIdoso(idosoId));
    }

    @PatchMapping("/{alertaId}/lido")
    public ResponseEntity<Void> marcarComoLido(@PathVariable Long alertaId) {
        alertaService.marcarComoLido(alertaId);
        return ResponseEntity.noContent().build();
    }
}
