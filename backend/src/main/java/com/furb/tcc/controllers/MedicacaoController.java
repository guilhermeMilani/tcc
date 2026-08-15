package com.furb.tcc.controllers;

import com.furb.tcc.dtos.requests.MedicacaoRequest;
import com.furb.tcc.entities.Medicacao;
import com.furb.tcc.entities.RegistroMedicacao;
import com.furb.tcc.entities.Usuario;
import com.furb.tcc.repositories.UsuarioRepository;
import com.furb.tcc.services.MedicacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/medicacoes")
@RequiredArgsConstructor
public class MedicacaoController {

    private final MedicacaoService medicacaoService;
    private final UsuarioRepository usuarioRepository;

    @PostMapping
    public ResponseEntity<Void> cadastrar(
            @RequestBody @Valid MedicacaoRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Usuario usuario = usuarioRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        medicacaoService.cadastrar(request, usuario);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/idoso/{idosoId}")
    public ResponseEntity<List<Medicacao>> listarPorIdoso(@PathVariable Long idosoId) {
        return ResponseEntity.ok(medicacaoService.listarPorIdoso(idosoId));
    }

    @PostMapping("/{medicacaoId}/adesao")
    public ResponseEntity<Void> registrarAdesao(
            @PathVariable Long medicacaoId,
            @RequestParam Boolean tomou) {
        medicacaoService.registrarAdesao(medicacaoId, tomou);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/idoso/{idosoId}/historico")
    public ResponseEntity<List<RegistroMedicacao>> buscarHistorico(
            @PathVariable Long idosoId,
            @RequestParam LocalDateTime inicio,
            @RequestParam LocalDateTime fim) {
        return ResponseEntity.ok(medicacaoService.buscarHistoricoAdesao(idosoId, inicio, fim));
    }
}
