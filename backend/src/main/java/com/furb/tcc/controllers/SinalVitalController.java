package com.furb.tcc.controllers;

import com.furb.tcc.dtos.requests.SinalVitalRequest;
import com.furb.tcc.entities.Idoso;
import com.furb.tcc.entities.SinalVital;
import com.furb.tcc.repositories.IdosoRepository;
import com.furb.tcc.repositories.SinalVitalRepository;
import com.furb.tcc.services.SinalVitalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Random;

@RestController
@RequestMapping("/sinais-vitais")
@RequiredArgsConstructor
public class SinalVitalController {

    private final SinalVitalService sinalVitalService;
    private final IdosoRepository idosoRepository;
    private final SinalVitalRepository sinalVitalRepository;

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

    @PostMapping("/sinais-vitais/popular-teste")
    public ResponseEntity<String> popularTeste(@AuthenticationPrincipal UserDetails userDetails) {
        Idoso idoso = idosoRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Idoso não encontrado"));

        // Executa em background sem bloquear a requisição
        new Thread(() -> {
            Random random = new Random();
            Instant agora = Instant.now();

            for (int i = 168; i >= 0; i--) {
                SinalVital sinal = SinalVital.builder()
                        .idosoId(String.valueOf(idoso.getId()))
                        .frequenciaCardiaca(65 + random.nextInt(20))
                        .spO2(95.0 + random.nextDouble() * 3)
                        .temperatura(36.0 + random.nextDouble() * 1.5)
                        .dataHora(agora.minusSeconds(i * 3600))
                        .build();
                sinalVitalRepository.salvar(sinal);
            }
            System.out.println("Popular teste concluído!");
        }).start();

        return ResponseEntity.ok("Populando em background... aguarde alguns minutos.");
    }
}