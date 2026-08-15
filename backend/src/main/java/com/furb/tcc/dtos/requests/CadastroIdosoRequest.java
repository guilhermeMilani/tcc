package com.furb.tcc.dtos.requests;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CadastroIdosoRequest {
    @NotBlank
    private String nome;
    @NotBlank @Email
    private String email;
    @NotBlank
    private String senha;
    private String telefone;
    private LocalDate dataNascimento;
    private String condicoesSaude;
}