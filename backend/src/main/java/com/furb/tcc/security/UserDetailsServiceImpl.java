package com.furb.tcc.security;

import com.furb.tcc.entities.Idoso;
import com.furb.tcc.entities.Usuario;
import com.furb.tcc.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + email));

        String role = usuario instanceof Idoso ? "ROLE_IDOSO" : "ROLE_CUIDADOR";

        return User.builder()
                .username(usuario.getEmail())
                .password(usuario.getSenha())
                .authorities(role)
                .build();
    }
}