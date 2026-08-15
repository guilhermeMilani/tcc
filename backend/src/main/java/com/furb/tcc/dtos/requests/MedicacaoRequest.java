package com.furb.tcc.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicacaoRequest {
    @NotNull
    private Long idosoId;
    @NotBlank
    private String nome;
    private String dosagem;
    private List<LocalTime> horarios;
}
