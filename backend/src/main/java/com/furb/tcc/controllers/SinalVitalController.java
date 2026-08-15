package com.furb.tcc.controllers;

import com.furb.tcc.dtos.requests.SinalVitalRequest;
import com.furb.tcc.entities.SinalVital;
import com.furb.tcc.services.SinalVitalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sinais-vitais")
@RequiredArgsConstructor
public class SinalVitalController {

    private final SinalVitalService sinalVitalService;

    @PostMapping
    public ResponseEntity<Void> registrar(@RequestBody @Valid SinalVitalRequest request) {
        sinalVitalService.registrar(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/{idosoId}")
    public ResponseEntity<List<SinalVital>> buscarHistorico(
            @PathVariable Long idosoId,
            @RequestParam(defaultValue = "24h") String range) {
        return ResponseEntity.ok(sinalVitalService.buscarHistorico(idosoId, range));
    }
}