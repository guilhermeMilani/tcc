package com.furb.tcc.controllers;

import com.furb.tcc.services.VinculoCodigoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/vinculos/codigo")
@RequiredArgsConstructor
public class VinculoCodigoController {

    private final VinculoCodigoService vinculoCodigoService;

    @PostMapping("/gerar")
    public ResponseEntity<Map<String, String>> gerarCodigo(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam Long idosoId) {

        String codigo = vinculoCodigoService.gerarCodigo(idosoId);
        return ResponseEntity.ok(Map.of("codigo", codigo));
    }

    @PostMapping("/vincular")
    public ResponseEntity<Void> vincularPorCodigo(
            @RequestParam Long cuidadorId,
            @RequestParam String codigo) {

        vinculoCodigoService.vincularPorCodigo(cuidadorId, codigo);
        return ResponseEntity.ok().build();
    }
}