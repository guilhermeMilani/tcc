package com.furb.tcc.controllers;

import com.furb.tcc.dtos.requests.VinculoRequest;
import com.furb.tcc.entities.Cuidador;
import com.furb.tcc.entities.Idoso;
import com.furb.tcc.services.VinculoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vinculos")
@RequiredArgsConstructor
public class VinculoController {

    private final VinculoService vinculoService;

    @PostMapping
    public ResponseEntity<Void> vincular(@RequestBody @Valid VinculoRequest request) {
        vinculoService.vincular(request.getCuidadorId(), request.getIdosoId());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping
    public ResponseEntity<Void> desvincular(@RequestBody @Valid VinculoRequest request) {
        vinculoService.desvincular(request.getCuidadorId(), request.getIdosoId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/cuidador/{cuidadorId}/idosos")
    public ResponseEntity<List<Idoso>> listarIdosos(@PathVariable Long cuidadorId) {
        return ResponseEntity.ok(vinculoService.listarIdososDoCuidador(cuidadorId));
    }

    @GetMapping("/idoso/{idosoId}/cuidadores")
    public ResponseEntity<List<Cuidador>> listarCuidadores(@PathVariable Long idosoId) {
        return ResponseEntity.ok(vinculoService.listarCuidadoresDoIdoso(idosoId));
    }
}
