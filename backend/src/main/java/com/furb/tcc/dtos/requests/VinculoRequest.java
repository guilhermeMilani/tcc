package com.furb.tcc.dtos.requests;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VinculoRequest {
    @NotNull
    private Long cuidadorId;
    @NotNull
    private Long idosoId;
}