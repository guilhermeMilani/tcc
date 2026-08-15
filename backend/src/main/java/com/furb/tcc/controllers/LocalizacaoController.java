package com.furb.tcc.controllers;

import com.furb.tcc.dtos.requests.LocalizacaoRequest;
import com.furb.tcc.entities.Localizacao;
import com.furb.tcc.services.LocalizacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/localizacao")
@RequiredArgsConstructor
public class LocalizacaoController {

    private final LocalizacaoService localizacaoService;

    @PostMapping
    public ResponseEntity<Void> registrar(@RequestBody @Valid LocalizacaoRequest request) {
        localizacaoService.registrar(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/panico")
    public ResponseEntity<Void> panico(@RequestBody @Valid LocalizacaoRequest request) {
        localizacaoService.registrarPanico(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/idoso/{idosoId}/ultima")
    public ResponseEntity<Localizacao> buscarUltima(@PathVariable Long idosoId) {
        return ResponseEntity.ok(localizacaoService.buscarUltimaLocalizacao(idosoId));
    }
}