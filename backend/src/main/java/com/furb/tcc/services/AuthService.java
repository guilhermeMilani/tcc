package com.furb.tcc.services;

import com.furb.tcc.dtos.requests.CadastroCuidadorRequest;
import com.furb.tcc.dtos.requests.CadastroIdosoRequest;
import com.furb.tcc.dtos.requests.LoginRequest;
import com.furb.tcc.entities.Cuidador;
import com.furb.tcc.entities.Idoso;
import com.furb.tcc.entities.Usuario;
import com.furb.tcc.repositories.CuidadorRepository;
import com.furb.tcc.repositories.IdosoRepository;
import com.furb.tcc.repositories.UsuarioRepository;
import com.furb.tcc.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final IdosoRepository idosoRepository;
    private final CuidadorRepository cuidadorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public String login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (!passwordEncoder.matches(request.getSenha(), usuario.getSenha())) {
            throw new RuntimeException("Senha inválida");
        }

        return jwtService.gerarToken(usuario);
    }

    public void cadastrarIdoso(CadastroIdosoRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email já cadastrado");
        }

        Idoso idoso = Idoso.builder()
                .nome(request.getNome())
                .email(request.getEmail())
                .senha(passwordEncoder.encode(request.getSenha()))
                .telefone(request.getTelefone())
                .dataNascimento(request.getDataNascimento())
                .condicoesSaude(request.getCondicoesSaude())
                .build();

        idosoRepository.save(idoso);
    }

    public void cadastrarCuidador(CadastroCuidadorRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email já cadastrado");
        }

        Cuidador cuidador = Cuidador.builder()
                .nome(request.getNome())
                .email(request.getEmail())
                .senha(passwordEncoder.encode(request.getSenha()))
                .telefone(request.getTelefone())
                .relacaoComIdoso(request.getRelacaoComIdoso())
                .build();

        cuidadorRepository.save(cuidador);
    }
}
