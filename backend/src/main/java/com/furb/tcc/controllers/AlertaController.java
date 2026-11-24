package com.furb.tcc.controllers;

import com.furb.tcc.entities.Alerta;
import com.furb.tcc.entities.TipoAlerta;
import com.furb.tcc.services.AlertaService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/alertas")
@RequiredArgsConstructor
public class AlertaController {

    private final AlertaService alertaService;

    public record AlertaResponse(Long id, TipoAlerta tipo, String descricao,
                                 LocalDateTime dataHora, boolean lido,
                                 Long idosoId, String nomeIdoso) {
        static AlertaResponse de(Alerta a) {
            return new AlertaResponse(a.getId(), a.getTipo(), a.getDescricao(),
                    a.getDataHora(), a.getLido(),
                    a.getIdoso().getId(), a.getIdoso().getNome());
        }
    }

    @GetMapping("/idoso/{idosoId}")
    public ResponseEntity<List<Alerta>> listarPorIdoso(@PathVariable Long idosoId) {
        return ResponseEntity.ok(alertaService.listarPorIdoso(idosoId));
    }

    @GetMapping("/cuidador/{cuidadorId}")
    public ResponseEntity<Page<AlertaResponse>> listarPorCuidador(
            @PathVariable Long cuidadorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        return ResponseEntity.ok(
                alertaService.listarPorCuidador(cuidadorId, PageRequest.of(page, size))
                        .map(AlertaResponse::de));
    }

    @GetMapping("/cuidador/{cuidadorId}/nao-lidos")
    public ResponseEntity<Map<String, Long>> contarNaoLidos(@PathVariable Long cuidadorId) {
        return ResponseEntity.ok(Map.of("total", alertaService.contarNaoLidos(cuidadorId)));
    }

    @PatchMapping("/cuidador/{cuidadorId}/lidos")
    public ResponseEntity<Void> marcarTodosComoLidos(@PathVariable Long cuidadorId) {
        alertaService.marcarTodosComoLidos(cuidadorId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{alertaId}/lido")
    public ResponseEntity<Void> marcarComoLido(@PathVariable Long alertaId) {
        alertaService.marcarComoLido(alertaId);
        return ResponseEntity.noContent().build();
    }
}