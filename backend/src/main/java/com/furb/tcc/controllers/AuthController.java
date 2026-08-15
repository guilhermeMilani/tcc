package com.furb.tcc.controllers;

import com.furb.tcc.dtos.requests.CadastroCuidadorRequest;
import com.furb.tcc.dtos.requests.CadastroIdosoRequest;
import com.furb.tcc.dtos.requests.LoginRequest;
import com.furb.tcc.dtos.responses.TokenResponse;
import com.furb.tcc.services.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody @Valid LoginRequest request) {
        String token = authService.login(request);
        return ResponseEntity.ok(new TokenResponse(token));
    }

    @PostMapping("/cadastro/idoso")
    public ResponseEntity<Void> cadastrarIdoso(@RequestBody @Valid CadastroIdosoRequest request) {
        authService.cadastrarIdoso(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/cadastro/cuidador")
    public ResponseEntity<Void> cadastrarCuidador(@RequestBody @Valid CadastroCuidadorRequest request) {
        authService.cadastrarCuidador(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}