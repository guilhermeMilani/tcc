package com.furb.tcc.dtos.requests;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SinalVitalRequest {
    @NotNull
    private Long idosoId;
    @NotNull
    private Integer frequenciaCardiaca;
    @NotNull
    private Double spO2;
    @NotNull
    private Double temperatura;
}