package com.furb.tcc.services;

import com.furb.tcc.entities.Cuidador;
import com.furb.tcc.entities.Idoso;
import com.furb.tcc.repositories.CuidadorRepository;
import com.furb.tcc.repositories.IdosoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TokenNotificacaoService {

    private final CuidadorRepository cuidadorRepository;
    private final IdosoRepository idosoRepository;

    @Transactional
    public void registrarParaCuidador(Long cuidadorId, String token) {
        Cuidador cuidador = cuidadorRepository.findById(cuidadorId)
                .orElseThrow(() -> new RuntimeException("Cuidador não encontrado"));

        String tokenLimpo = normalizar(token);
        liberarToken(tokenLimpo, cuidadorId);

        cuidador.setTokenNotificacao(tokenLimpo);
        cuidadorRepository.save(cuidador);
    }

    @Transactional
    public void registrarParaIdoso(Long idosoId, String token) {
        Idoso idoso = idosoRepository.findById(idosoId)
                .orElseThrow(() -> new RuntimeException("Idoso não encontrado"));

        String tokenLimpo = normalizar(token);
        liberarToken(tokenLimpo, idosoId);

        idoso.setTokenNotificacao(tokenLimpo);
        idosoRepository.save(idoso);
    }

    // Remove o token de qualquer outra conta (cuidador ou idoso)
    private void liberarToken(String token, Long usuarioAtualId) {
        if (token == null) return;

        cuidadorRepository.findByTokenNotificacao(token).stream()
                .filter(c -> !c.getId().equals(usuarioAtualId))
                .forEach(c -> {
                    c.setTokenNotificacao(null);
                    cuidadorRepository.save(c);
                });

        idosoRepository.findByTokenNotificacao(token).stream()
                .filter(i -> !i.getId().equals(usuarioAtualId))
                .forEach(i -> {
                    i.setTokenNotificacao(null);
                    idosoRepository.save(i);
                });
    }

    private String normalizar(String token) {
        return (token == null || token.isBlank()) ? null : token;
    }
}