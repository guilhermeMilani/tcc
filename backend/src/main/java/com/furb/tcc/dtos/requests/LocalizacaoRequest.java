package com.furb.tcc.dtos.requests;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocalizacaoRequest {
    @NotNull
    private Long idosoId;
    @NotNull
    private Double latitude;
    @NotNull
    private Double longitude;
}
